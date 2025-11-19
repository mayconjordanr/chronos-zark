import { createClient } from "@/utils/supabase/server";
import { FinancialSummary } from "@/components/finance/FinancialSummary";
import { TransactionList } from "@/components/finance/TransactionList";
import { redirect } from "next/navigation";

export default async function FinancePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Transactions
    const { data: transactions } = await supabase
        .from("finance_transactions")
        .select("*, category:finance_categories(name)")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(20);

    // Calculate Summary (Mock logic for now, ideally use DB aggregation or RPC)
    // For MVP, we calculate in JS from the fetched transactions (limited) or fetch totals separately.
    // Let's fetch all for this month to calculate totals correctly.
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyTransactions } = await supabase
        .from("finance_transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .gte("date", startOfMonth.toISOString());

    const income =
        monthlyTransactions
            ?.filter((t) => t.type === "income")
            .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    const expense =
        monthlyTransactions
            ?.filter((t) => t.type === "expense")
            .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    // Fetch Total Balance (Sum of accounts)
    const { data: accounts } = await supabase
        .from("finance_accounts")
        .select("balance")
        .eq("user_id", user.id);

    const totalBalance =
        accounts?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

    // Format transactions for the list
    const formattedTransactions =
        transactions?.map((t) => ({
            id: t.id,
            description: t.description || "Sem descrição",
            amount: Number(t.amount),
            type: t.type as "income" | "expense",
            category: t.category?.name || "Geral",
            date: t.date,
        })) || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Financeiro
                </h1>
            </div>

            <FinancialSummary
                totalBalance={totalBalance}
                monthlyIncome={income}
                monthlyExpense={expense}
            />

            <TransactionList transactions={formattedTransactions} />
        </div>
    );
}
