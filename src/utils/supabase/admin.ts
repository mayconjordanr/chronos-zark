import { createClient } from "@supabase/supabase-js";

// Note: This client should ONLY be used in secure server-side contexts (API routes, Server Actions)
// It bypasses RLS if the SERVICE_ROLE_KEY is used.
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
