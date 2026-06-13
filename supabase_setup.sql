-- ============================================
-- 備忘君 Supabase セットアップSQL
-- Supabaseの「SQL Editor」で全文実行してください
-- ============================================

-- ============================================
-- 1. todosテーブル
-- ============================================
create table if not exists public.todos (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title             text not null,
  description       text,
  type              text not null check (type in ('work', 'private')),
  is_routine        boolean not null default false,
  category          text check (category in ('shopping','reservation','procedure','payment','housework','gift','other')),
  is_completed      boolean not null default false,
  reminder_settings jsonb,
  created_at        timestamptz not null default now()
);

-- RLSを有効化
alter table public.todos enable row level security;

-- 自分のデータのみ閲覧可能
create policy "todos: 自分のデータを閲覧" on public.todos
  for select using (auth.uid() = user_id);

-- 自分のデータのみ作成可能
create policy "todos: 自分のデータを作成" on public.todos
  for insert with check (auth.uid() = user_id);

-- 自分のデータのみ更新可能
create policy "todos: 自分のデータを更新" on public.todos
  for update using (auth.uid() = user_id);

-- 自分のデータのみ削除可能
create policy "todos: 自分のデータを削除" on public.todos
  for delete using (auth.uid() = user_id);

-- ============================================
-- 2. push_subscriptionsテーブル
-- ============================================
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  keys       jsonb not null,
  created_at timestamptz not null default now()
);

-- RLSを有効化
alter table public.push_subscriptions enable row level security;

-- 自分のsubscriptionのみ閲覧可能
create policy "push: 自分のデータを閲覧" on public.push_subscriptions
  for select using (auth.uid() = user_id);

-- 自分のsubscriptionのみ作成可能
create policy "push: 自分のデータを作成" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

-- 自分のsubscriptionのみ削除可能
create policy "push: 自分のデータを削除" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- send-push APIがservice_roleで全件読めるようにするポリシー
-- （Cronからの通知送信に必要）
create policy "push: service_roleは全件閲覧可能" on public.push_subscriptions
  for select using (auth.role() = 'service_role');

create policy "push: service_roleは全件削除可能" on public.push_subscriptions
  for delete using (auth.role() = 'service_role');

-- ============================================
-- 3. pg_cronによる定時通知（1分ごと）
-- ※ Supabaseダッシュボードの Extensions で
--   「pg_cron」と「pg_net」を有効にしてから実行
-- ============================================

-- pg_cron拡張が有効なことを確認してから以下を実行
select cron.schedule(
  'send-push-notifications',  -- ジョブ名
  '* * * * *',                -- 毎分実行
  $$
  select net.http_post(
    url     := 'https://YOUR_VERCEL_URL/api/send-push',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
    body    := '{}'::jsonb
  )
  $$
);

-- ジョブの確認
-- select * from cron.job;

-- ジョブを削除したい場合
-- select cron.unschedule('send-push-notifications');
