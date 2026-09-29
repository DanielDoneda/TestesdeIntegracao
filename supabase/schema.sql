create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 4 and 10),
  title text not null default 'Testes de Integração',
  status text not null default 'lobby' check (status in ('lobby', 'question', 'reveal', 'finished')),
  current_question integer not null default -1,
  question_started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  registration text not null,
  access_token_hash text not null,
  score integer not null default 0,
  answered_count integer not null default 0,
  joined_at timestamptz not null default now(),
  unique (room_id, registration)
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  question_index integer not null,
  selected_option integer not null,
  correct boolean not null,
  points integer not null check (points between 0 and 1000),
  response_ms integer not null check (response_ms >= 0),
  answered_at timestamptz not null default now(),
  unique (participant_id, question_index)
);

create index if not exists participants_room_score_idx on public.participants(room_id, score desc);
create index if not exists answers_room_question_idx on public.answers(room_id, question_index);

alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.answers enable row level security;

create or replace function public.record_answer(
  p_room_id uuid,
  p_participant_id uuid,
  p_question_index integer,
  p_selected_option integer,
  p_correct boolean,
  p_points integer,
  p_response_ms integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.answers (
    room_id, participant_id, question_index, selected_option, correct, points, response_ms
  ) values (
    p_room_id, p_participant_id, p_question_index, p_selected_option, p_correct, p_points, p_response_ms
  );

  update public.participants
  set score = score + p_points,
      answered_count = answered_count + 1
  where id = p_participant_id and room_id = p_room_id;

  if not found then
    raise exception 'Participante não encontrado';
  end if;
end;
$$;

revoke all on function public.record_answer(uuid, uuid, integer, integer, boolean, integer, integer) from public;
revoke all on function public.record_answer(uuid, uuid, integer, integer, boolean, integer, integer) from anon;
revoke all on function public.record_answer(uuid, uuid, integer, integer, boolean, integer, integer) from authenticated;
grant execute on function public.record_answer(uuid, uuid, integer, integer, boolean, integer, integer) to service_role;
