create table if not exists public.stripewolf_records (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('AutomixSettings','PerformanceSession','DjProfile','HardwareMapping','AudioRoutingSettings')),
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_at timestamptz not null default now()
);
create index if not exists stripewolf_records_owner_kind on public.stripewolf_records(owner_id,kind,created_at desc);
alter table public.stripewolf_records enable row level security;
create policy stripewolf_read_own on public.stripewolf_records for select to authenticated using ((select auth.uid())=owner_id);
create policy stripewolf_insert_own on public.stripewolf_records for insert to authenticated with check ((select auth.uid())=owner_id);
create policy stripewolf_update_own on public.stripewolf_records for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy stripewolf_delete_own on public.stripewolf_records for delete to authenticated using ((select auth.uid())=owner_id);
revoke all on public.stripewolf_records from anon;
grant select,insert,update,delete on public.stripewolf_records to authenticated;
