# Handoff: CHS Boys Soccer Program Hub

## Overview

A season-management hub for the Covington High School boys soccer program: schedule, rosters, game reports, derived statistics, power ratings, player availability, announcements, printable reports, and multi-season history. It is used by coaches on desktop to enter data, and by players on phones to check the schedule and RSVP.

The design exists and is complete. It is a working single-file HTML prototype, fully interactive, with every page built and every calculation implemented. **The job in the target codebase is not to invent the product — it is to rebuild this same product on a real backend.**

## Why this is being handed off

The prototype keeps all of its data in the browser's `localStorage`. That is the one limitation the design cannot solve on its own, and it is the reason for this handoff:

- Data lives in one browser on one computer. Nothing syncs between devices.
- Clearing site data erases the season.
- Everyone who opens the hub gets their own private copy, so players never see what a coach typed.
- PIN "authentication" is a client-side string comparison against data in the file. It is a convenience gate, not security.

**The build target:** the same application, with a server, a real database, real accounts, and real authorization. Everything else in this handoff — the pages, the rules, the formulas, the visual system — should carry over as specified.

## About the design files

The files in this bundle are **design references created in HTML**. They are a prototype demonstrating intended look, behavior and calculation logic — not production code to port line by line.

Recreate them in the target environment using its established patterns and libraries. If no environment exists yet, choose the stack; a conventional server-rendered or SPA web app with a relational database is a good fit, because nearly every screen is a table or form over relational data.

Two things are worth reading rather than reimplementing from scratch:

- **The logic class inside the prototype** (`CHS Boys Soccer Hub.dc.html`) contains the real, working implementations of every derived figure — power ratings, aggregates, denominators, the close-season snapshot. Treat these as the specification. They were reviewed line by line with the program's coach and corrected; the formulas section below records the conclusions.
- **`CHS-Hub-Design-Notes.md`** is the full design record, including the reasoning behind each rule and every judgement call already settled with the user. Read it before making design decisions of your own.

## Fidelity

**High fidelity.** Final colors, typography, spacing, copy, states and interactions. Recreate the UI faithfully using the target codebase's libraries. The prototype is the visual source of truth; exact token values are listed under Design Tokens.

## The rule the whole design rests on

**Every fact is typed in exactly one place.**

1. The **schedule** defines that a game exists.
2. The **game report** defines what happened in it.
3. Everything else is *derived*: scores, player statistics, team statistics, season comparison, power ratings, team-goal progress, attendance, program history.

There is no second place to type a score. Preserve this. Every bug found during the design review was a second way of counting the same thing, and four corollaries came out of it:

- **One notion of "today."** A single function; never a scattered `Date.now()`, never a date written into prose.
- **One way to count a goal.** A goal record's `team` field holds the *credited* team; an `ownGoal` flag records only how it happened. Team goal counts are always "score entries credited to CHS" — own goals for CHS count for CHS. The flag keeps the scorer's personal tally clean and drives an "(OG)" label; it must never become a second counting rule.
- **One way to count a played game.** A game counts as played when its report holds at least one goal, **or** a `noGoals` flag is set (an explicitly confirmed 0–0), **or** it carries a backfilled final score. Cards and player stats alone are deliberately *not* a result — otherwise logging a yellow card at half time posts a 0–0 into the season record.
- **One denominator per average, stated rather than blended.** A game can be scored without its player stats or team stats being filled in. Each average divides by the games that actually fed it, and the UI states the counts. `N/A` means "not logged", never zero.

## Access model

Three roles, currently by PIN, to be replaced with real accounts:

| Role | How they get in | What they see |
|---|---|---|
| Public | No sign-in | Home (schedule and announcements preview, staff directory, crest, address), Schedule, Announcements |
| Player | Player PIN from the roster | Read-only, scoped to their own team. Lands on their availability check-in. Sees Overview, Schedule, Announcements, Roster, Stats, Availability, Team Goals, Results, Program History, and Power Rankings if Varsity |
| Coach | Staff PIN | Everything, with edit rights, including past seasons |

Coach PINs are auto-assigned by the app (next free four digits) and shown on the staff card. Player PINs are set by the coach on the roster. In the rebuild: real authentication, roles as authorization, and per-team scoping for players. Note that a coach can edit closed seasons — that is intended, and worth an audit trail in a real system.

## Navigation

Grouped, collapsible; the group containing the active page is forced open. A **season switcher** sits at the top of the main content area for every signed-in user and drives every page at once.

- **This Season** — Overview, Schedule, Availability, Results, Stats, Power Rankings, Team Goals, Roster
- **History** — Seasons, Program History
- **Manage** — Staff, Teams, Reports, Announcements

## Data model

The prototype's storage keys map cleanly onto tables. Suggested shape:

| Entity | Key fields | Notes |
|---|---|---|
| `seasons` | id, label (`YYYY–YYYY`), closed, snapshot, district_finish, district_champion | Exactly one season is open at a time |
| `events` | id, season_id, type, team, date, start_time, end_time, location, status, title, game_num, opponent, home_away, district, playoff, playoff_round | The schedule. Types: Practice, Game, Scrimmage, Classroom Session, Other. `team` may be "All" |
| `game_reports` | event_id, no_goals, final_chs, final_opp | One per event; `final_*` only for backfilled score-only games |
| `goals_scored` | report_id, team, scorer_jersey, minute, assist_jersey, own_goal | The scoring summary; the sole source of scorelines |
| `discipline` | report_id, card (Yellow/Red), team, jersey | |
| `player_game_stats` | report_id, player_id, half1, half2, shots_on, shots_off, clearances, interceptions, tackles_won, passes_completed, passes_missed, saves | Varsity only |
| `team_game_stats` | event_id, corners, free_kicks, fouls, possession_pct, shots_conceded, pass/possession location splits | |
| `players` | id, name, team, jersey, positions, grade, grad_year, captain, pin | |
| `staff` | id, first, last, email, pin, roles[] | A role is either team + coaching position, or a school admin position |
| `teams` | name | Varsity is permanent |
| `opponents` | name | Consistent naming is what makes all-time head-to-head work |
| `awards` | season_id, player, honor | Individual honors |
| `team_goals` | season_id, description, metric, target | Varsity only; target is a number or a record string |
| `pr_tracker` | date, chs_rank, chs_power_rating, last_playoff_team, last_playoff_rating | |
| `opponent_records` | event_id, wins, losses, ties | Typed by the coach; feeds power ratings |
| `announcements` | id, title, body, team, posted_by, source, pinned, posted_at | Prototype stores prose timestamps; **use real timestamps in the rebuild** |
| `rsvps` | player_id, event_id, response (Yes/No/Maybe) | Missing row means "no response" |

**Season scoping is not optional.** Every event, goal, RSVP and team goal belongs to a season. Every list, filter and figure must respect the season switcher rather than assuming the current season.

**Everything is team-driven.** Teams are dynamic data, not an enum. Every table, filter and dropdown is generated from the teams list. Do not hardcode Varsity / JV Blue / JV Gold anywhere.

**Varsity vs non-Varsity.** Only Varsity games collect per-player statistics and feed power ratings, season comparison, team goals and program history. Other teams collect a scoring summary and discipline only, and their stats tables omit the Varsity-only columns rather than showing N/A.

**Playoffs are in the record, out of the maths.** Playoff games count toward games played, wins, losses, goals for and against, and win percentage. They are excluded from power ratings, from season comparison, from regular-season game numbering, and from the close-season schedule copy.

**Closed-season snapshots win.** Closing a season writes its record onto the season row. Both the seasons page and program history read that snapshot rather than recomputing, so editing an old game cannot move a past year's record. The UI promises this; honor it everywhere a closed season's record appears.

## Verified formulas

These were confirmed with the coach. Implement them exactly.

**Win percentage** — `(wins + 0.5 × ties) ÷ games played`, everywhere in the app.

**Power ratings**, per Varsity regular-season game, ordered by game number. The opponent's win/loss/tie record is typed; everything else is calculated:

1. **Points awarded** — win 5, draw 2.5, loss 0
2. **Full opponent points** — `(opponent wins × 1) + (opponent ties × 0.5)`; opponent losses are deliberately ignored
3. **Percent of opponent points** — win 1.00, draw 0.75, loss 0.50
4. **Opponent points awarded** — full opponent points × percent
5. **Power points per game** — points awarded + opponent points awarded
6. **Total power points** — running cumulative total across played games
7. **Power rating** — total power points ÷ games played to that point

Playoff games are excluded: the rating decides seeding, so playoff results must not feed the number that produced them. The scale is intentionally lopsided — points awarded caps at 5 while opponent points grow with the opponent's win total, so opponent strength carries more weight late in the season. This mirrors the state's formula; do not "fix" it.

**Power ranking tracker** — positions from the last playoff position = `32 − CHS rank`. Rating difference = CHS rating − last playoff position's rating.

**Player statistics** — shot percentage = on ÷ (on + off). Pass percentage = completed ÷ (completed + missed). Goals against average = goals conceded in games the keeper appeared in ÷ those games. An appearance is a half played, maximum two per game. Clean sheets require both a reported game and an appearance in it, for teams that record appearances; teams that do not record appearances credit the squad.

**Team statistics, three denominators** — goals per game and goals conceded over games with a final score; shots per game and goal conversion over games with player stats; corners, fouls, free kicks, possession and shots conceded over games with team stats. Goal conversion counts goals from the same games as its shots, so it cannot exceed 100%. State all three counts in the UI.

**Team goal status** needs a direction per metric, because "met" is not the same test for each:

- *Higher is better* — wins, win %, goals for, average goals for, goal difference, shutouts, district wins, power **rating**
- *Lower is better* — losses, goals against, average goals against, district losses, and power **ranking** (a position, where 1st is best)
- *No verdict* — ties. A tie target has no honest direction; status reads "—"
- *Compared as a record* — district record. The target is typed whole ("5-1-0") and kept as a string; met when wins are at least the target and losses no more than it

**Attendance** means RSVP intent, not turnout. Yes percentage = yes ÷ answered. A non-answer sits in its own column and never counts against a player — chosen deliberately so a player is not punished for a coach forgetting to chase RSVPs. RSVPs lock at the event's start time, and the report covers past events only.

**Close season** is a four-step flow: confirm the record about to be snapshotted (listing games with no result); set the final district standing (defaulting to "Not recorded", never to 1st — a default must never be the most consequential answer); name the new season and choose what to copy onto its schedule (district games / everything / nothing, with dates cleared and home/away flipped); carry the roster forward with 12th-graders pre-unticked. On finish: snapshot and close, write flagged captains into individual honors, carry the roster, leave team goals attached to the season that set them.

## Screens

Each of these exists in the prototype and should be opened while building. The prototype is the layout specification; this list is the inventory and the intent.

**Overview** — Next Up (the soonest non-cancelled event in the viewed season that has not started, with Today/Tomorrow/dated label and status pill); Team Snapshot, one full-width row per active team with players, overall record, district record, goals for, against, difference, power rating, power ranking (non-Varsity shows "—" in Varsity-only columns so columns stay aligned); recent announcements; Season Comparison against the season immediately before the *viewed* one, regular season only on both sides, with "to date" slicing the earlier season to the number of regular-season games completed in the viewed one.

**Schedule** — sorted by date then start time. Event form: type, team (or All), game number, opponent, home/away, district checkbox, playoff checkbox revealing round and location, event name for "Other", date, start and end time, location, status. Titles are generated. Opponent input autocompletes against the managed opponent list and registers new names on save. Cancelling an event keeps it visible with a cancelled marker rather than deleting it.

**Results** — one table per active team: game number, date, opponent, home/away, CHS score, opponent score, result, and a coach-only Update Result action. **Scores are read-only here** — they are counted from the scoring summary.

**Update Result** — the single data-entry point for everything statistical. Four sections: scoring summary (team, scorer jersey, minute, assist, own-goal checkbox, listed in minute order, with a "this game finished 0–0" checkbox that appears when the summary is empty); discipline; team stats including pass and possession location splits with a live totals hint; and player stats, Varsity only, a row per player with halves, shots, clearances, interceptions, tackles, passes and saves — where goals, assists, clean sheets and cards are calculated and shaded, never typed. This is a desktop screen and is wide by design.

**Stats** — one table per team, with Leaderboard and Team Stats tabs. Nothing is typed. Varsity columns: player, number, appearances, goals, assists, shots on, shots off, shot %, clearances, interceptions, tackles won, passes completed, passes missed, pass %, saves, clean sheets, goals against average, cards. Non-Varsity: player, number, goals, assists, cards, clean sheets. Team Stats tab: a per-team card with the three stated denominators, location bars, and a per-game log linking back into Update Result.

**Power Rankings** (Varsity only) — the power ratings table per game, and the Power Ranking Tracker with date, CHS rank and rating, positions from the last playoff position, the team currently in it, its rating, and the difference.

**Team Goals** — Varsity only, season-scoped. Description, metric, target, calculated actual, status verdict.

**Roster** — cards with jersey, name, team, grade, class, positions, PIN, and a captain badge. Captain is a checkbox; more than one per team is fine.

**Staff** — name, optional email, and a repeatable role block. Each role is either a school administrator position or a team plus coaching position.

**Teams** — add and remove teams (Varsity locked), and manage the opponents list. An opponent already on a schedule cannot be removed; rename instead, and history follows.

**Seasons** (coach only) — one card per season, split by team: a Varsity block with district record and finish, a regular-season table and a playoffs table; a block per non-Varsity team; and individual honors. Close Season lives here.

**Program History** — season by season; team records (top 5 of completed seasons: best win %, most goals, fewest conceded, most shutouts, biggest win, most district wins), with the in-progress season listed separately; all-time individual honors; and head-to-head, one row per opponent with games, all-time record, goals, difference, streak, last meeting and result.

**Availability** — coaches see a tracker of players against upcoming events with an RSVP pill per cell, a legend and a team filter. Players see their own check-in. Events come from the real schedule, scoped to the season, limited to Practice, Game, Scrimmage and Classroom Session. An "All" event applies to every squad; a dash means the event does not apply to that player's team.

**Reports** — season-scoped, with Attendance and Season Stats tabs, CSV export and print. Plus **Game Day Roster**: pick team and game, generate a print sheet with the school "C" logo, underlined title, matchup, date, kickoff, location, the squad in two numbered columns by jersey with "(C)" for captains, then head coach, assistant coaches, principal and athletic director.

## Interactions and behavior

- **Modals** for every add and edit, with inline field validation and a confirm dialog for destructive actions.
- **Filters** are button toggles built from the teams list; event type is a dropdown.
- **The season switcher** re-scopes every page at once. Viewing a closed season shows a banner naming it; closed seasons stay editable.
- **Print** is real: the game day roster and the reports print cleanly, and the two print targets are mutually exclusive so they cannot stack.
- **Responsive:** coaches enter data on desktop. Mobile matters for player RSVPs, viewing the schedule, reading and posting announcements, and viewing results; those flows are built for 390px. RSVP buttons are 48px tall. Wide tables scroll horizontally with a swipe hint **on mobile only** — an unconditional minimum width clipped a column at desktop widths, so the breakpoint drives it.

## Design tokens

**Colors**

| Token | Value | Use |
|---|---|---|
| Navy | `#0A3868` | Primary, sidebar, table headers, buttons |
| Tan / gold | `#A1825D` | Borders, accents, badges, section labels |
| Page background | `#FAF8F4` | App background |
| Card background | `#FBF9F5` | Cards, callouts |
| Card border | `#D9C9A8` | All card and table borders |
| Divider | `#E8DFCC` | Light internal rules |
| Body text | `#1C1C1C` | |
| Secondary text | `#6B6B6B`, `#4A4A4A` | |
| Muted | `#9B9B9B` | Empty states, "—" |
| Accent gold | `#D8B989` | Active nav item |
| Non-Varsity table header | `#4A6B93` | Distinguishes non-Varsity tables |

**Status pills** — background / text (/ border where given):

- Confirmed, Win — `#E7F3EA` / `#217A3B`
- RSVP open — `#FCF1D8` / `#8A6215` / `#C99A2E`
- Cancelled, Loss — `#FAE6E6` / `#B23B3B`
- Postponed — `#E3EBFA` / `#2B57A5`
- TBD, Tie — `#ECECEC` / `#6B6B6B` / `#9B9B9B`

**Typography** — headings Georgia serif; body Helvetica Neue, Arial. Body text 13–14px, table text 12–12.5px, section labels 11px uppercase with 0.06em tracking, page titles 22–30px.

**Geometry** — border radius 6px on controls and pills, 8–10px on cards; card borders 1px; table cells 7–8px vertical padding; card padding 14–20px; gaps 10–14px. Mobile breakpoint 860px. Minimum touch target 44px on player flows, 48px on RSVP buttons.

## Assets

- `assets/chs-lions-logo.png` — the school wordmark, in the sidebar, on a small white plate so its blue ring reads against navy. Included in this bundle.
- **Two images still needed:** the school crest for the sidebar, and the "C" logo printed at the top of the game day roster sheet. Both are empty drop slots in the prototype. Ask the coach for the artwork.
- `assets/rb/*.png` — screenshots of the prototype, used by the coach guide document. Included so that document renders.
- No icon library: the prototype's icons are small inline SVGs. Use whatever icon set the target codebase already has.

## Files in this bundle

| File | What it is |
|---|---|
| `CHS Boys Soccer Hub.dc.html` | The full prototype. Open it in a browser. Coach PINs 1001–1004 once staff exist; the logic class at the bottom holds every formula |
| `CHS-Hub-Design-Notes.md` | The complete design record: rules, page inventory, data model, formulas, device expectations, settled judgement calls, and the reasoning behind each |
| `CHS Hub — Setup and Go-Live.dc.html` | Printable setup document written for the coach: clearing data, build order, PIN distribution, test run |
| `CHS Hub — Coach Guide.dc.html` | Printable coach guide: ten walkthroughs with screenshots, what not to do, troubleshooting, season checklists, glossary |
| `support.js`, `doc-page.js`, `image-slot.js` | Runtime pieces the HTML files load. Not part of the product — they exist so the prototypes open and print |
| `assets/` | The logo, and the screenshots the coach guide displays |

## Note on the existing repository

Repository: `warrenguillotjr/chsboyssoccer`, branch `main`. It holds an earlier generation of this same product — `index.html` (a single shared season password), `player-select.html`, `coach.html`, `player.html`, `app.js`, `style.css` — published to GitHub Pages at `warrenguillotjr.github.io/chsboyssoccer`, with **Google Sheets as its database**.

**This bundle supersedes that code.** Every rule and formula above reflects a full page-by-page review completed after it, and several exist because the earlier logic counted the same figure twice. Do not merge old logic forward; start from these files and this document.

Two things from the old version are worth carrying:

- **`assets/logo.gif`** — the Covington Lions "C". Already included here as `assets/chs-c-logo.gif` and placed on the game day roster sheet.
- **The Google Sheets backend.** It is not what a production build should use, but it is proof of the shape that actually works for this program: one shared source of data that a coach can also open and read directly. Whatever the rebuild uses, coaches should be able to get their season out of it without a developer.

The old README records program facts worth keeping: Covington High School, Covington, Louisiana; District 6-I; head coach and program director Warren Guillot, Jr.; public site at `sites.google.com/view/chsboyssoccerprogram`.

## Where to start

1. Open the prototype and use it for twenty minutes as a coach. Enter a game report and watch the numbers move.
2. Read `CHS-Hub-Design-Notes.md`.
3. Model the database from the table above, season-scoped from the start.
4. Build the schedule and the game report first. Everything else is derived from those two, so nothing else can be verified until they work.
5. Then real accounts and authorization, which is the whole reason for the rebuild.

## Placeholder content

The prototype's sample data has been cleared, so it starts empty. Any earlier screenshots or notes referring to "Player 1", "Coach 1" or "Opponent 5" are placeholders from the design phase, not real people or real opponents. Real names, PINs, schedule and roster come from the coach.
