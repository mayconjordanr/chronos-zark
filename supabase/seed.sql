-- SEED DATA (Run this in Supabase SQL Editor)

-- 1. Create a test user (Optional - usually you create via Auth, but we can insert a profile if we know the ID)
-- For this seed, we assume you will sign up in the app first.
-- BUT we can insert global categories if we want, or per-user.
-- Our schema has `user_id` on categories. So we need a user first.

-- Since we can't easily know the user ID ahead of time without them signing up,
-- we will create a function to "seed for user" that can be called via RPC or Trigger.

-- Function to seed initial categories for a user
create or replace function public.seed_user_data(target_user_id uuid)
returns void as $$
declare
  wallet_id uuid;
begin
  -- 1. Create Default Account (Wallet)
  insert into public.finance_accounts (user_id, name, type, balance, color)
  values (target_user_id, 'Carteira Principal', 'wallet', 0.00, '#f56f10')
  returning id into wallet_id;

  -- 2. Create Categories
  -- Income
  insert into public.finance_categories (user_id, name, type, icon, color) values
  (target_user_id, 'Salário', 'income', '💰', '#10b981'),
  (target_user_id, 'Freelance', 'income', '💻', '#34d399');

  -- Expense
  insert into public.finance_categories (user_id, name, type, icon, color) values
  (target_user_id, 'Alimentação', 'expense', '🍔', '#f43f5e'),
  (target_user_id, 'Transporte', 'expense', '🚗', '#3b82f6'),
  (target_user_id, 'Moradia', 'expense', '🏠', '#8b5cf6'),
  (target_user_id, 'Lazer', 'expense', '🎉', '#ec4899'),
  (target_user_id, 'Saúde', 'expense', '💊', '#ef4444'),
  (target_user_id, 'Educação', 'expense', '📚', '#f59e0b'),
  (target_user_id, 'Geral', 'expense', '📦', '#6b7280');

  -- 3. Create API Key for n8n (Example)
  -- Note: In production, generate a real hash. Here we use '123456' as the "hash" for easy testing.
  insert into public.api_keys (user_id, key_hash, label)
  values (target_user_id, '123456', 'n8n Agent Key');

end;
$$ language plpgsql;

-- Usage:
-- select public.seed_user_data('YOUR_USER_ID_HERE');
