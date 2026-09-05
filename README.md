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

**Phase 1 (foundation) is built and pushed to `main`:** Supabase schema +
RLS, PIN-based sign-in (hashed, session-backed, lockout-protected) for both
coaches and players, teams/opponents/staff/roster management, schedule
CRUD, and the full Update Result data-entry flow (goals, discipline, team
stats, Varsity player stats, the no-goals/backfill-score paths). Derived
stats surfaces (Power Rankings, Team Goals, full Season Comparison), the
season lifecycle (close-season wizard, Program History), and Reports/print
are **not yet built** — see the project's saved implementation plan for
the phased roadmap.

**Deployment:** a Vercel project has been created for this repo under the
owner's **personal** Vercel/GitHub account — deliberately kept separate
from the `DMES` team (a different, work-scoped Vercel account), so this
Claude session's Vercel connection (authenticated as the work account)
cannot see or manage that project. Any further Vercel configuration for
this project has to happen directly in the Vercel dashboard, or from a
session connected to the personal account.

**Blocked on, in order:**
1. The owner was having trouble logging into the **Supabase dashboard**
   (as of this session) — needs to be resolved first, since the next two
   items both require dashboard access.
2. Grab the **service_role / secret key** from Supabase (Project Settings →
   API Keys) and add it as `SUPABASE_SERVICE_ROLE_KEY` in the Vercel
   project's Environment Variables (plus local `.env.local`), then
   redeploy — see "Local setup" below for the full variable list.
3. One-time toggle in Supabase: **Authentication → Hooks → Customize
   Access Token (JWT) Hook**, enabling the `custom_access_token_hook`
   function the schema migration already created. No API/CLI equivalent.

Until those three are done, PIN sign-in cannot work end to end even though
the code and schema for it are complete.

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
| `.claude/skills/` | `/start-session` and `/wrap-session` — orient at the start of a session and sync this README + git history at the end of one |
