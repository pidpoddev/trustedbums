alter table public.client_pay_programs
  add column if not exists approval_status text not null default 'APPROVED'
    check (approval_status in ('APPROVED', 'PENDING', 'DENIED')),
  add column if not exists requested_by text references public.profiles(id) on delete set null,
  add column if not exists reviewed_by text references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists request_reason text;

create index if not exists client_pay_programs_company_approval_idx
  on public.client_pay_programs (company_id, approval_status, created_at desc);

drop policy if exists "Client users can request own company pay programs" on public.client_pay_programs;
create policy "Client users can request own company pay programs"
on public.client_pay_programs for insert
to anon, authenticated
with check (
  company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
);
