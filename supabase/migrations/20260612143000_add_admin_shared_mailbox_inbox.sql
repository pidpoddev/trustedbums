create table if not exists public.admin_shared_mailbox_messages (
  id uuid primary key default gen_random_uuid(),
  mailbox text not null default 'bums@trustedbums.com',
  graph_message_id text not null,
  internet_message_id text,
  graph_conversation_id text,
  direction text not null default 'INBOUND',
  subject text not null default '(no subject)',
  body_preview text,
  body_content text,
  body_content_type text not null default 'text',
  from_email text,
  from_name text,
  to_recipients jsonb not null default '[]'::jsonb,
  cc_recipients jsonb not null default '[]'::jsonb,
  received_at timestamptz,
  sent_at timestamptz,
  has_attachments boolean not null default false,
  is_read boolean not null default false,
  importance text,
  web_link text,
  category text not null default 'uncategorized',
  status text not null default 'OPEN',
  assigned_to text references public.profiles(id) on delete set null,
  handled_by text references public.profiles(id) on delete set null,
  handled_at timestamptz,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_shared_mailbox_messages_direction_check check (direction in ('INBOUND', 'OUTBOUND')),
  constraint admin_shared_mailbox_messages_body_content_type_check check (body_content_type in ('text', 'html')),
  constraint admin_shared_mailbox_messages_category_check check (category in ('dmarc', 'legal', 'question', 'complaint', 'privacy', 'abuse', 'support', 'client_criteria', 'uncategorized')),
  constraint admin_shared_mailbox_messages_status_check check (status in ('OPEN', 'IN_PROGRESS', 'HANDLED', 'ARCHIVED')),
  constraint admin_shared_mailbox_messages_mailbox_check check (mailbox ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint admin_shared_mailbox_messages_unique_graph_id unique (mailbox, graph_message_id)
);

create table if not exists public.admin_shared_mailbox_send_events (
  id uuid primary key default gen_random_uuid(),
  mailbox_message_id uuid references public.admin_shared_mailbox_messages(id) on delete set null,
  action text not null,
  from_mailbox text not null default 'bums@trustedbums.com',
  to_recipients text[] not null default '{}',
  cc_recipients text[] not null default '{}',
  subject text,
  body text not null,
  status text not null default 'QUEUED',
  error text,
  sent_by text references public.profiles(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint admin_shared_mailbox_send_events_action_check check (action in ('NEW', 'REPLY', 'REPLY_ALL')),
  constraint admin_shared_mailbox_send_events_status_check check (status in ('QUEUED', 'SENT', 'FAILED')),
  constraint admin_shared_mailbox_send_events_from_mailbox_check check (from_mailbox ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

drop trigger if exists set_admin_shared_mailbox_messages_updated_at on public.admin_shared_mailbox_messages;
create trigger set_admin_shared_mailbox_messages_updated_at
before update on public.admin_shared_mailbox_messages
for each row execute function public.set_updated_at();

alter table public.admin_shared_mailbox_messages enable row level security;
alter table public.admin_shared_mailbox_send_events enable row level security;

drop policy if exists "Admins can manage shared mailbox messages" on public.admin_shared_mailbox_messages;
create policy "Admins can manage shared mailbox messages"
on public.admin_shared_mailbox_messages for all to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "Admins can read shared mailbox sends" on public.admin_shared_mailbox_send_events;
create policy "Admins can read shared mailbox sends"
on public.admin_shared_mailbox_send_events for select to authenticated
using (private.is_admin());

drop policy if exists "Admins can create shared mailbox sends" on public.admin_shared_mailbox_send_events;
create policy "Admins can create shared mailbox sends"
on public.admin_shared_mailbox_send_events for insert to authenticated
with check (private.is_admin());

drop policy if exists "Admins can update shared mailbox sends" on public.admin_shared_mailbox_send_events;
create policy "Admins can update shared mailbox sends"
on public.admin_shared_mailbox_send_events for update to authenticated
using (private.is_admin())
with check (private.is_admin());

grant select, insert, update, delete on public.admin_shared_mailbox_messages to authenticated;
grant select, insert, update on public.admin_shared_mailbox_send_events to authenticated;

create index if not exists admin_shared_mailbox_messages_mailbox_received_idx
  on public.admin_shared_mailbox_messages (mailbox, received_at desc nulls last, created_at desc);

create index if not exists admin_shared_mailbox_messages_status_idx
  on public.admin_shared_mailbox_messages (status, category, updated_at desc);

create index if not exists admin_shared_mailbox_send_events_message_idx
  on public.admin_shared_mailbox_send_events (mailbox_message_id, created_at desc);
