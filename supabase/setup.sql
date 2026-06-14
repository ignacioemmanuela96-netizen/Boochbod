-- Profile table
create table if not exists profile (
  id integer primary key default 1,
  username text default 'boochbod',
  display_name text default 'BoochBod',
  bio text default 'probiotic kombucha gummy 🍵\ngut health for women who want to feel themselves again',
  link text default 'linkinbio.boochbod.com',
  followers text default '14.2K',
  following text default '312',
  avatar_url text,
  highlights jsonb default '[
    {"emoji":"BB","label":"About Us","bg":"#033F3B","isBB":true,"cover_url":null},
    {"emoji":"✨","label":"Results","bg":"#FFB4DB","cover_url":null},
    {"emoji":"🧬","label":"Gut Facts","bg":"#C5D93A","cover_url":null},
    {"emoji":"⭐","label":"Reviews","bg":"#ffd700","cover_url":null},
    {"emoji":"🍬","label":"Product","bg":"#033F3B","cover_url":null}
  ]'::jsonb
);

insert into profile (id) values (1) on conflict do nothing;

-- Posts table
create table if not exists posts (
  id serial primary key,
  title text not null default 'Untitled',
  hook text,
  caption text,
  date text,
  day text default 'Mon',
  platform text default 'Instagram',
  format text,
  week integer default 1,
  status text default 'To Film',
  theme text,
  pillar text default 'P1 Gut Education',
  media_type text default 'image',
  media_url text,
  cover_url text,
  hide boolean default false,
  position integer default 0,
  created_at timestamptz default now()
);

-- RLS
alter table posts enable row level security;
create policy "Public read posts" on posts for select using (true);
create policy "Auth write posts" on posts for all using (auth.role() = 'authenticated');

alter table profile enable row level security;
create policy "Public read profile" on profile for select using (true);
create policy "Auth write profile" on profile for all using (auth.role() = 'authenticated');
