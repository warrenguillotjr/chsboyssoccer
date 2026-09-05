# CHS Boys Soccer Program Hub

Season-management hub for the Covington High School boys soccer program:
schedule, rosters, game reports, derived stats, power ratings, player
availability, announcements, printable reports, and multi-season history.

- **School:** Covington High School — Covington, Louisiana
- **Program:** Boys Soccer — District 6-I
- **Head Coach & Program Director:** Warren Guillot, Jr.
- **Stack:** Next.js (App Router) + Supabase (Postgres, Auth, RLS), deployed to Vercel

This is a rebuild of an earlier GitHub Pages + Google Sheets prototype. The
full design specification — data model, formulas, screens, and every
settled judgement call — lives in [`design/README.md`](design/README.md)
and [`design/CHS-Hub-Design-Notes.md`](design/CHS-Hub-Design-Notes.md). The
`design/*.dc.html` files are the original interactive prototype; open them
in a browser to see the intended look and behavior. This rebuild
supersedes that prototype's code — it does not port it line by line.

## Status

**Phase 1 (foundation) is built:** Supabase schema + RLS, PIN-based sign-in
(hashed, session-backed, lockout-protected) for both coaches and players,
teams/opponents/staff/roster management, schedule CRUD, and the full
Update Result data-entry flow (goals, discipline, team stats, Varsity
player stats, the no-goals/backfill-score paths). Derived stats surfaces
(Power Rankings, Team Goals, full Season Comparison), the season lifecycle
(close-season wizard, Program History), and Reports/print are **not yet
built** — see the project's saved implementation plan for the phased
roadmap.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in the service role key (see below)
npm run dev
```

`.env.local` needs:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — already set
  for the project's Supabase instance.
- `SUPABASE_SERVICE_ROLE_KEY` — **not filled in.** Grab it from the
  Supabase dashboard (Project Settings → API → service_role secret) and
  add it locally and to the Vercel project's environment variables. It's
  required for the PIN sign-in route and for creating staff/player
  accounts, and must never be exposed to the browser (no `NEXT_PUBLIC_*`
  prefix).

The Supabase Auth Hook that stamps `role`/`team_id` onto sign-in JWTs
(`custom_access_token_hook`, created by the schema migration) also needs to
be enabled once in the dashboard under **Authentication → Hooks → Customize
Access Token (JWT) Hook** — this one toggle has no API/CLI equivalent.

## Repo layout

| Path | Purpose |
|---|---|
| `src/app/` | Next.js App Router routes |
| `src/lib/supabase/` | Server/browser Supabase clients + generated DB types |
| `src/lib/auth/` | PIN hashing, lockout, session/role helpers |
| `design/` | Original design handoff bundle (spec, prototype, coach guide) |
| `assets/` | Legacy logo asset carried over from the old site |
