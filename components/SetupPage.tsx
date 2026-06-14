'use client'
import { useState } from 'react'

const SQL = `create table if not exists profile (
  id integer primary key default 1,
  username text default 'boochbod',
  display_name text default 'BoochBod',
  bio text default 'probiotic kombucha gummy 🍵\ngut health for women who want to feel themselves again',
  link text default 'linkinbio.boochbod.com',
  followers text default '14.2K',
  following text default '312',
  avatar_url text,
  highlights jsonb default '[{"emoji":"BB","label":"About Us","bg":"#033F3B","isBB":true,"cover_url":null},{"emoji":"✨","label":"Results","bg":"#FFB4DB","cover_url":null},{"emoji":"🧬","label":"Gut Facts","bg":"#C5D93A","cover_url":null},{"emoji":"⭐","label":"Reviews","bg":"#ffd700","cover_url":null},{"emoji":"🍬","label":"Product","bg":"#033F3B","cover_url":null}]'::jsonb
);
insert into profile (id) values (1) on conflict do nothing;

create table if not exists posts (
  id serial primary key,
  title text not null default 'Untitled',
  hook text, caption text, date text,
  day text default 'Mon',
  platform text default 'Instagram',
  format text, week integer default 1,
  status text default 'To Film', theme text,
  pillar text default 'P1 Gut Education',
  media_type text default 'image',
  media_url text, cover_url text,
  hide boolean default false,
  position integer default 0,
  created_at timestamptz default now()
);

alter table posts enable row level security;
drop policy if exists "Public read posts" on posts;
drop policy if exists "Auth write posts" on posts;
create policy "Public read posts" on posts for select using (true);
create policy "Auth write posts" on posts for all using (true);

alter table profile enable row level security;
drop policy if exists "Public read profile" on profile;
drop policy if exists "Auth write profile" on profile;
create policy "Public read profile" on profile for select using (true);
create policy "Auth write profile" on profile for all using (true);`

export default function SetupPage({ isAdmin }: { isAdmin: boolean }) {
  const [copied, setCopied] = useState(false)

  function copySQL() {
    navigator.clipboard.writeText(SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openSupabase() {
    window.open('https://supabase.com/dashboard/project/ukeameiosvpoyvauajub/sql/new', '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#033F3B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#C5D93A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26, fontWeight: 900, color: '#033F3B' }}>BB</div>
          <div style={{ color: '#C5D93A', fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>BoochBod</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>One-time database setup</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {/* Steps */}
          <div style={{ padding: '28px 28px 0' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#033F3B', marginBottom: 20 }}>Setup your database in 3 steps</div>

            {[
              { n: 1, title: 'Copy the SQL below', desc: 'Click the button to copy it to your clipboard.' },
              { n: 2, title: 'Open Supabase SQL Editor', desc: 'Click the button below — it opens in a new tab.' },
              { n: 3, title: 'Paste & Run', desc: 'Paste the SQL (Cmd+V), then press Cmd+Enter to run it.' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#033F3B', color: '#C5D93A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{step.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: '#8e8e8e', marginTop: 2 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* SQL preview */}
          <div style={{ margin: '8px 28px 0', background: '#f5f5f5', borderRadius: 10, padding: '12px 14px', fontSize: 11, fontFamily: 'monospace', color: '#444', maxHeight: 120, overflow: 'auto', border: '1px solid #e0e0e0' }}>
            {SQL.slice(0, 300)}...
          </div>

          {/* Buttons */}
          <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={copySQL} style={{ background: copied ? '#C5D93A' : '#033F3B', color: copied ? '#033F3B' : '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
              {copied ? '✓ Copied!' : '📋 Copy SQL to clipboard'}
            </button>
            <button onClick={openSupabase} style={{ background: '#3ecf8e', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Open Supabase SQL Editor ↗
            </button>
            <button onClick={() => window.location.reload()} style={{ background: 'transparent', color: '#8e8e8e', border: '1.5px solid #dbdbdb', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              ↻ I ran it — refresh the page
            </button>
          </div>

          {!isAdmin && (
            <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 28px', textAlign: 'center' }}>
              <a href="/login" style={{ color: '#033F3B', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Admin? Log in →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
