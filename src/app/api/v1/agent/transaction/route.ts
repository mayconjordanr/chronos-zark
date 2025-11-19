import { createAdminClient } from "@/utils/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing x-api-key header" },
            { status: 401 }
        );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Authenticate
    // In a real app, we would hash the incoming key and compare with key_hash.
    // For this MVP, we assume the header sends the matching hash/key directly.
    const { data: keyData, error: keyError } = await supabaseAdmin
        .from("api_keys")
        .select("user_id")
        .eq("key_hash", apiKey)
        .single();

    if (keyError || !keyData) {
        return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
    }

    const userId = keyData.user_id;

    try {
        const body = await request.json();
        const { description, amount, type, category_name, date } = body;

        if (!description || !amount || !type) {
            return NextResponse.json(
                { error: "Missing required fields: description, amount, type" },
                { status: 400 }
            );
        }

        // 2. Resolve Category
        let categoryId = null;
        if (category_name) {
            const { data: category } = await supabaseAdmin
                .from("finance_categories")
                .select("id")
                .eq("user_id", userId)
                .ilike("name", category_name) // Case insensitive
                .single();

            if (category) {
                categoryId = category.id;
            } else {
                // Fallback to "Geral" or create it?
                // Let's try to find "Geral"
                const { data: geralCat } = await supabaseAdmin
                    .from("finance_categories")
                    .select("id")
                    .eq("user_id", userId)
                    .ilike("name", "Geral")
                    .single();

                categoryId = geralCat?.id || null;
            }
        }

        // 3. Resolve Account (Default to first found or create one)
        // Since the input doesn't specify account, we need to guess.
        let accountId = null;
        let currentBalance = 0;

        const { data: accounts } = await supabaseAdmin
            .from("finance_accounts")
            .select("id, balance")
            .eq("user_id", userId)
            .limit(1);

        if (accounts && accounts.length > 0) {
            accountId = accounts[0].id;
            currentBalance = Number(accounts[0].balance);
        } else {
            // Create a default account if none exists
            const { data: newAccount, error: accError } = await supabaseAdmin
                .from("finance_accounts")
                .insert({
                    user_id: userId,
                    name: "Carteira Principal",
                    type: "wallet",
                    balance: 0,
                })
                .select()
                .single();

            if (!accError && newAccount) {
                accountId = newAccount.id;
                currentBalance = 0;
            }
        }

        // 4. Insert Transaction
        const { data: transaction, error: txError } = await supabaseAdmin
            .from("finance_transactions")
            .insert({
                user_id: userId,
                account_id: accountId,
                category_id: categoryId,
                amount: amount,
                description: description,
                type: type,
                date: date || new Date().toISOString(),
                is_paid: true, // Assume paid if coming from agent?
            })
            .select()
            .single();

        if (txError) {
            console.error("Transaction Insert Error:", txError);
            return NextResponse.json(
                { error: "Failed to create transaction" },
                { status: 500 }
            );
        }

        // 5. Update Account Balance
        if (accountId) {
            const newBalance =
                type === "income"
                    ? currentBalance + Number(amount)
                    : currentBalance - Number(amount);

            await supabaseAdmin
                .from("finance_accounts")
                .update({ balance: newBalance })
                .eq("id", accountId);

            // Return the new TOTAL balance (could be just this account or all)
            // Prompt asked for "new_balance". Let's return this account's new balance.
            return NextResponse.json({
                success: true,
                id: transaction.id,
                new_balance: newBalance,
            });
        }

        return NextResponse.json({
            success: true,
            id: transaction.id,
            new_balance: currentBalance, // No account updated
        });

    } catch (err) {
        console.error("API Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
