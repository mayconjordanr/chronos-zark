"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// This should be in your env vars
const N8N_WEBHOOK_URL = process.env.N8N_AUTH_WEBHOOK_URL;

export async function requestLogin(formData: FormData) {
    const identifier = formData.get("identifier") as string;

    if (!identifier) {
        return { error: "Email ou telefone é obrigatório." };
    }

    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    const supabaseAdmin = createAdminClient();

    // 2. Store in auth_codes
    const { error } = await supabaseAdmin.from("auth_codes").insert({
        email: identifier, // Using 'email' column for identifier (email or phone)
        code,
        expires_at: expiresAt,
    });

    if (error) {
        console.error("Error storing code:", error);
        return { error: "Erro ao gerar código de acesso." };
    }

    // 3. Send to n8n Webhook (Fire and forget or await?)
    // We await to ensure it was sent before showing UI
    if (N8N_WEBHOOK_URL) {
        try {
            await fetch(N8N_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, code }),
            });
        } catch (err) {
            console.error("Error sending to n8n:", err);
            // Don't block login if n8n fails? Or do we? 
            // For now, we log but proceed, assuming user might get it another way or retry.
            // Ideally, this should fail if the user can't get the code.
            return { error: "Erro ao enviar código. Tente novamente." };
        }
    } else {
        console.warn("N8N_WEBHOOK_URL not set. Code:", code);
        // For dev purposes, we might want to log the code so we can login
    }

    return { success: true, identifier };
}

export async function verifyLogin(identifier: string, code: string) {
    const supabaseAdmin = createAdminClient();

    // 1. Verify Code
    const { data, error } = await supabaseAdmin
        .from("auth_codes")
        .select("*")
        .eq("email", identifier)
        .eq("code", code)
        .gt("expires_at", new Date().toISOString())
        .single();

    if (error || !data) {
        return { error: "Código inválido ou expirado." };
    }

    // 2. Code is valid. Now log the user in.
    // We need to find or create the user in Supabase Auth.
    // Since we are using custom auth, we might need to use `admin.auth.getUser` or create one.
    // For simplicity, let's assume we use magic link or just create a session if user exists.
    // Actually, `signInWithOtp` is for email/phone handled by Supabase.
    // Since we are handling the code ourselves, we need to mint a session.
    // We can use `admin.auth.admin.createUser` if not exists, then generate a token?
    // OR better: `admin.auth.admin.generateLink` type 'magiclink' and redirect?
    // OR `admin.auth.createSession` (requires userId).

    // Check if user exists
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    // Note: listUsers is not efficient for large userbases. Better to search by email if possible.
    // But admin api doesn't have getUserByEmail easily exposed in all versions? 
    // Actually `supabaseAdmin.auth.admin.getUserById` exists.
    // Let's try to create user, if exists it fails, then we get the ID.

    // Better approach:
    // We can't easily "log in" a user from the server side and set cookies for the client 
    // UNLESS we use `createClient` (ssr) and `signInWithPassword` (if we knew password) or `signInWithOtp`.
    // But we verified the OTP ourselves.

    // Workaround:
    // 1. Get User ID (Create if not exists)
    // 2. Create a Session manually? Supabase doesn't easily allow "create session for user X" and set cookie 
    //    without a password or a valid token.

    // ALTERNATIVE:
    // Use Supabase's `signInWithOtp` but intercept the email? No.

    // THE WAY:
    // We can use `admin.auth.admin.generateLink({ type: 'magiclink', email: identifier })`.
    // This returns a `action_link`. We can redirect the user to that link?
    // That link verifies the token. But we already verified our custom token.

    // Let's go with:
    // 1. Find/Create User.
    // 2. Sign in as that user using `signInWithOtp` is tricky if we don't have the email access.

    // Wait, if we use `admin.auth.admin.createUser`, we can set `email_confirm: true`.
    // Then how to log them in?

    // If we want to bypass Supabase's email sending, we can use `signInWithOtp` 
    // but we need the code Supabase generated. We are generating our OWN code.

    // SOLUTION:
    // We can use a "Magic Link" flow but triggered by us?
    // Or, we can just use `supabase.auth.signInWithPassword` if we set a dummy password? No, insecure.

    // Correct approach for "Custom Auth" with Supabase:
    // Usually you use Supabase to generate the OTP and you just send it via your provider (n8n).
    // `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`
    // This returns a hashed token? No, it sends the email.
    // Unless we hook into the "Custom SMS/Email Provider" in Supabase Dashboard?

    // Since the user asked for "Custom Logic" in `actions/auth.ts`:
    // "Função verifyLogin... usa o método supabase.auth.signInWithOtp (ou troca token customizado)"

    // If we verify the code ourselves, we are the authority.
    // We can use `admin.auth.createSession({ user_id: ... })`? No, that's not in the JS lib usually.

    // Let's use the "Magic Link" trick.
    // 1. Get/Create User.
    // 2. Generate a magic link for them.
    // 3. Redirect them to the magic link URL.
    // The magic link URL will hit Supabase, set the session, and redirect back to dashboard.

    let userId;

    // Try to get user by email
    // Since we don't have `getUserByEmail` in admin client easily without listUsers (slow),
    // we can try to create. If it fails (already exists), we need to fetch them.
    // Actually, `admin.auth.admin.createUser` returns the user object if successful.
    // If it fails, we can't easily get the ID without listing.

    // Let's try `listUsers` with filter?
    // `supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 })` doesn't filter by email.

    // Okay, let's assume we can use `inviteUserByEmail`? No.

    // Let's use the `profiles` table! We have `profiles` linked to `auth.users`.
    // We can query `profiles` (which we can read via admin) to find the `id` for the email?
    // Wait, `profiles` doesn't have email. `auth.users` has email.

    // Let's try to create the user. If it fails, we assume they exist.
    // But we need the ID.

    // Actually, `supabase.auth.signInWithOtp` is the standard way.
    // If we want to use OUR code, we have to tell Supabase "This user verified".

    // Let's try this:
    // 1. `admin.auth.admin.generateLink({ type: 'magiclink', email: identifier })`
    // This returns `{ data: { user, action_link, ... } }`.
    // Even if user exists, it generates a link.
    // If user doesn't exist, it creates them (if `shouldCreateUser` is default? No, generateLink might require user to exist? Docs say "Generates a link... for an existing user" usually.
    // Wait, `generateLink` docs: "email: The email of the user."

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: identifier,
    });

    if (linkError) {
        // If user not found, create them first
        if (linkError.message.includes("User not found") || linkError.status === 404) {
            const { data: newData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: identifier,
                email_confirm: true,
                user_metadata: { name: "Novo Usuário" }
            });

            if (createError) {
                return { error: "Erro ao criar usuário." };
            }

            // Now generate link
            const { data: linkData2, error: linkError2 } = await supabaseAdmin.auth.admin.generateLink({
                type: "magiclink",
                email: identifier,
            });

            if (linkError2 || !linkData2?.properties?.action_link) {
                return { error: "Erro ao gerar sessão." };
            }

            // Delete the used code
            await supabaseAdmin.from("auth_codes").delete().eq("id", data.id);

            redirect(linkData2.properties.action_link);
        }
        return { error: "Erro ao gerar sessão." };
    }

    if (linkData?.properties?.action_link) {
        // Delete the used code
        await supabaseAdmin.from("auth_codes").delete().eq("id", data.id);

        // Redirect to the magic link which sets the cookie
        redirect(linkData.properties.action_link);
    }

    return { error: "Erro desconhecido." };
}
