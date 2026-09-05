# CHS Boys Soccer Program Hub — Design Notes

Design file: `CHS Boys Soccer Hub.dc.html`
Last substantive session: **4 Sep 2026**

---

## ⚠ NEXT SESSION — AGENDA

Design, the data-connection review and the go-live runbook are all **complete** (runbook written 5 Sep 2026 — see below).

Still outstanding before go-live:
- **Real leadership names.** `SCHOOL_LEADERSHIP` is now only a fallback — a staff member with an admin role of Principal / Athletic Director overrides it on the Game Day Roster. Either add those staff records or edit the constant.
- **CHS "C" logo** into `<image-slot id="chs-c-logo">` on the Game Day Roster sheet. The sidebar crest is a separate slot (`chs-crest`); the sidebar wordmark logo is a real file (`assets/chs-lions-logo.png`).
- **Five judgement calls** are still unconfirmed — see "Open questions" at the bottom.

---

## Session log — 5 Sep 2026 (go-live runbook)

Answered by the user: two printable documents, no technical knowledge assumed, all ten coach tasks get step-by-step walkthroughs with labelled screenshots, setup written for the person standing the hub up and the coach guide for the rest of the staff. Extras requested and included: troubleshooting, what not to do, data location and backups, season-start and season-end checklists, glossary.

Delivered:
- `CHS Hub — Setup and Go-Live.dc.html` — flowing `doc-page` document. Clearing test data, build order (teams → opponents → staff → season → roster → schedule → goals), the file-level hand-over list, PIN distribution, a five-step test run, and keeping CSV copies.
- `CHS Hub — Coach Guide.dc.html` — flowing `doc-page` document. Sign-in, the single-source rule, then the ten walkthroughs; each screenshot lives in `assets/rb/` and was captured from the live hub signed in as Coach 1.

**Called out plainly in both:** all state is `localStorage`, so the hub lives in one browser on one machine, nothing syncs between devices, and clearing site data erases the season. Both documents name a single "record computer" for data entry and recommend monthly CSV exports.

The file-level go-live jobs (`DEMO_TODAY_ISO`, the seed constants, the two image slots, leadership names) are stated in the setup document as a hand-over list rather than as instructions — the reader was assumed non-technical.

---

## Session log — 4 Sep 2026

The whole point of the session: walk every page and confirm each figure traces back to a single source. The derivation chain was traced end to end — Schedule → game report → derived scores → Stats / Power Ratings / Team Snapshot / Season Comparison / Seasons / Program History → Reports. **Every page walked; every finding resolved.** No figure is typed in two places.

**Data-connection fixes**
- *Season Comparison compared a closed season to itself.* The "previous" season was picked relative to the **open** season while the current column was scoped to the **viewed** season, so viewing an old season compared it against itself and every difference read zero. `priorSeason` now derives from `viewSeason`, and the two right-hand column headers plus the footnote name the **viewed** season (`comparisonSeasonLabel`) instead of the open one.
- *Team Snapshot ignored closed-season snapshots.* Overview recomputed a closed season's Varsity record from live games while Seasons and Program History read the snapshot, so the pages could disagree. Team Snapshot now reads record/GF/GA/GD from `viewSeason.snapshot` when the viewed season is closed. District record, Power Rating and Power Ranking still come from live games — the snapshot doesn't carry them.
- *Power Rankings was hidden for scores-only seasons* while Team Snapshot showed a Power Rating for the same season. Power Ratings need only scores plus the typed opponent records, so the page is now gated on played Varsity games (`powerRankingsAvailable`) rather than on `seasonHasDetail`, and the Stats page's thin-season note no longer claims power ratings are unavailable.
- *Team Goals weren't season-scoped.* One flat list, wiped at close-out, but Actual came from the season being viewed — so a closed season showed this year's targets against that year's numbers, and past targets were unrecoverable. Goals now carry a `seasonId` (Varsity only, confirmed with the user) and survive close-out.
- *Playoffs and the headline record.* Confirmed as intended: GP/W/L, GF/GA and win % include playoff games everywhere (Team Snapshot, Seasons, Program History, the close-out snapshot), matching the usual convention for an overall record. Two consequences were corrected instead: **Power Ratings now excludes playoff games**, and **Season Comparison is regular season only on both sides**.
- *Team Stats mixed denominators.* Shots/Game divided player-stat totals by scored games, and Goal Conversion divided goals from every scored game by shots from only the logged ones — capable of reading over 100%. Each average now divides by the games that fed it, with the three counts stated on the card.
- *Clean sheets were credited to the whole squad.* The increment sat outside the appearance check. A clean sheet now requires an appearance in games that record per-player stats (Varsity); games that record none (non-Varsity, where appearances aren't collected) still credit the squad. A confirmed 0–0 and a backfilled final score also had to be admitted into the leaderboard's game set, or the season's only shutout credited nobody.
- *A report with no goals fabricated a 0–0.* Any content in a report (a card, a ticked half) with no scoring summary and no `finalChs`/`finalOpp` fell through to the backfill branch, where the missing finals read 0 — the game counted as a played 0–0 tie in the record, Stats, Power Ratings and Program History. A genuine goalless draw was indistinguishable from an unreported game. **Resolved with an explicit 0–0 confirmation**, described below.

**Reports, rebuilt (4 Sep 2026)**
The Attendance report read two hardcoded constants (`AVAILABILITY_EVENTS_RAW`, `RSVP_RESPONSES_RAW`) rather than the schedule or the roster, so it showed the same four invented events forever, for every season — the largest single-source violation left in the hub. Decisions taken: attendance means **RSVP intent, now persisted**, not actual turnout; the report covers **past events only**; a non-answer is its own column and stays **out of the percentage**; RSVPs **lock at the event's start time**; Reports follows the **season switcher** and the date pickers are gone; Season Stats is **one table per team**; **CSV and Print** both work. Details under Availability and Reports below.

**Split notions of "today", found while fixing the above**
Three places had their own idea of the current date: Next Up and the Overview subhead were hardcoded prose, Home's "Upcoming" list had no date filter at all and showed past events, and the new RSVP gating used the wall clock. All four now read one `todayMs()` source. See "One notion of today".

**Mobile pass**
Confirmed with the user: coaches enter data and work on **desktop**; mobile matters for player RSVPs, schedule viewing, announcements (read and post) and results. Schedule, Announcements and the post-announcement modal were already sound at 390px. Fixed: Team Snapshot compressed nine columns to ~15px each on a phone (now scrolls, mobile only — see Devices); RSVP buttons were 34px tall (now 48px, thumb-sized); wide tables on Overview and Results gained a swipe hint on mobile. Details under "Devices".

**Rules established this session** — each one exists because a second way of counting the same thing appeared:
- One notion of "today" (`todayMs()`).
- One way to count a goal (`scores.filter(x => x.team === 'CHS')`).
- One way to count a played game (any report content, including a confirmed 0–0 or a backfilled final).
- One denominator per average, stated rather than blended.

**Open — needs a decision**

_(none outstanding from the review)_

---

## What this is
A single-file program hub for Covington High School boys soccer. PIN-based sign-in, three roles (public / player / coach), season-scoped data, and a strict rule that every number is derived from one source rather than typed twice.

School: Covington High School, 73030 Lion Dr, Covington, LA 70433.

## Access model
- **Public (no PIN):** Home (schedule + announcements preview, staff directory, crest/address), Schedule, Announcements, and a "Coach/Player Access" item that opens the PIN screen.
- **Coach PIN** (from the Staff list) → full nav and edit rights.
- **Player PIN** (from the Roster) → read-only, scoped to that player's team, lands on their Availability check-in.
- Sidebar footer shows the signed-in identity + Sign out, or "Not signed in".
- Placeholder coach PINs are 1001–1004; new staff get the next free 4-digit PIN automatically, shown on their Staff card.

## Navigation
Grouped and collapsible; the group holding the active page is forced open.

- **This Season** — Overview, Schedule, Availability, Results, Stats, Power Rankings, Team Goals, Roster
- **History** — Seasons, Program History
- **Manage** — Staff, Teams, Reports, Announcements

Players see: Overview, Schedule, Announcements, Roster, Stats, Availability, Team Goals, Results, Power Rankings (Varsity players only), Program History.

A **season switcher** sits at the top of the main content area for every signed-in user and drives every page at once. Viewing a closed season shows a banner naming it; closed seasons remain fully editable.

---

## The data model

All state persists to `localStorage` under `chsHubV1.*`:

| Key | Holds |
|---|---|
| `.seasons` | `{ id, label, closed, snapshot, districtFinish, districtChampion }` — exactly one has `closed: false` |
| `.schedule` | every event, each stamped with a `seasonId` |
| `.gameReports` | per event id: scoring summary, discipline, per-player stats, and optional `finalChs`/`finalOpp` |
| `.teamGameStats` | per event id: team totals (corners, fouls, possession, location splits) |
| `.roster` | players, including the `captain` flag |
| `.staff` | staff with a `roles` array |
| `.teams` | active team names |
| `.opponents` | managed opponent list |
| `.awards` | individual honors, per season |
| `.teamGoals` | season goals |
| `.prTracker` | Power Ranking Tracker entries |
| `.oppRecords` | opponent W/L/T per game, for Power Ratings |
| `.announcements` | posts |
| `.rsvps` | player availability responses, `{ playerId: { eventId: 'Yes' | 'No' | 'Maybe' } }` |

**Legacy keys, written once but no longer read:** `.results` (manual scores), `.prevSeason` (flat previous-season list, migrated into `.schedule`), `.playerStats` (season totals). Safe to delete at go-live.

### Single sources of truth
1. The **Schedule** defines every game.
2. A **game report** (Results → Update Result) defines what happened in it.
3. Everything else is derived: Results scores, Stats, Team Stats, Season Comparison, Power Ratings, Team Goal actuals, Program History.

A game report may instead carry `finalChs`/`finalOpp` — a score with no summary behind it. The derived score prefers the summary and falls back to these, which is what lets a backfilled season hold scores only.

**Reported vs unreported.** An empty scoring summary is ambiguous — nobody has filed the game yet, or it genuinely finished 0–0. A game therefore counts as **played** only when one of three things is true: the summary holds at least one goal, the report's `noGoals` flag is set, or it carries `finalChs`/`finalOpp`. Cards and player stats on their own are deliberately *not* a result, so logging a yellow card before the final whistle can no longer post a 0–0 into the record. The flag is set by a **"This game finished 0–0"** checkbox that appears in the Scoring Summary section of Update Result whenever the summary is empty; the section's caption states plainly what Results will show. Clean sheets in the Stats leaderboard likewise require a reported game (and an appearance — see below), and goals conceded read from the summary or, for a backfilled game, from `finalOpp`.

### Seasons
Past seasons are not a separate shape — a game is "past" only because of its `seasonId`. A one-time `bootstrapSeasons()` migration stamped existing events and folded the old flat previous-season list into real schedule events. Labels are `YYYY–YYYY` throughout (`seasonLabelForYear`).

`seasonHasDetail(id)` is true when any game in a season has a scoring summary or player stats. When false, Stats and Power Rankings show a note instead of empty tables; the schedule and scores still show.

**Snapshots are authoritative.** Closing a season writes GP/W/L/T/win%/GF/GA/GD onto it, and both the Seasons page and Program History read the record from the snapshot rather than recomputing — so editing an old game can't move a closed season's record. Figures the snapshot doesn't carry (shutouts, biggest win, district wins, head-to-head) still come from live games. Locked rows read "Final (locked)".

---

## One notion of "today"

`DEMO_TODAY_ISO` + `todayMs()` are the single source for the current date. Next Up, the Overview subhead, Home's "Upcoming" list, the Availability tracker's upcoming/locked split and the attendance report's past-events filter all read it. It is set to `'2026-08-20'` — after the last played game (Aug 15) and matching the seeded Power Ranking Tracker entry, so Reports has content while the Availability tracker still has upcoming events; **set it to `''` at go-live** and the hub uses the real clock. Before this existed, Next Up and the subhead were hardcoded prose while the RSVP gating used the wall clock, so Overview claimed a practice was happening today while Availability showed nothing upcoming.

## Pages

### Overview
- **Next Up** — derived: the soonest non-cancelled event in the viewed season that hasn't started, with a Today / Tomorrow / dated label and the event's own status pill.
- **Team Snapshot** — full-width row per active team: Players, Overall record, District record, GF, GA, GD, Power Rating, Power Ranking. Non-Varsity teams show "—" in the Varsity-only columns so the columns stay aligned. All derived.
- **Recent Announcements**.
- **Season Comparison** — 7 columns: category, Final prev, To Date prev, To Date current, Final current, To Date Comparison, Final Comparison. Compares the **viewed** season against the one immediately before it, **regular season only on both sides**; "To Date prev" slices that season to the number of regular-season games completed in the viewed season. Playoffs are excluded here (and only here) so a deep run in the earlier season can't land inside the slice and be compared against league form. Rows: GP, Wins, Losses, Ties, Win %, GF, Avg GF/Game, GA, Avg GA/Game, GD.

**Win % = (W + 0.5T) / GP** everywhere in the hub.

### Schedule
Sorted by date, then start time. Event form: Type (Practice / Game / Scrimmage / Classroom Session / Other), Team (or **All**), Game # + Opponent + Home/Away for game-likes, **District game** checkbox, **Playoff game** checkbox (reveals Round + Location), Event Name for Other, Date, Start/End Time, Location, Status. Title is generated. Opponent uses a `datalist` against the managed opponent list and registers new names on save.

### Results
One table per active team, generated from the Teams list. Columns: Game #, Date, Opponent, Home/Away, CHS Score, Opponent Score, Result, and a coach-only **Update Result**. Scores are read-only — counted from the scoring summary.

### Update Result — the game report
The single data-entry point for everything statistical.
- **Scoring Summary** — Scoring Team, Scored By (#), Minute, Assist (# or blank), plus an **Own Goal** checkbox that credits the other team and displays "(OG)". Listed in minute order.
- **Game Discipline** — Yellow/Red, Team, Player (#).
- **Team Stats** — corners, free kicks, fouls, possession %, shots conceded, plus pass and possession location splits with a live "totals X%" hint.
- **Player Stats** (Varsity only) — a row per Varsity player: 1st/2nd Half checkboxes, Shots On/Off, Clearances, Interceptions, Tackles Won, Passes Comp./Missed, Saves. Goals, Assists, Clean Sheets, Yellow and Red are calculated from the sections above and shaded.

### Stats
One table per active team; no team filter. Tabs: Leaderboard and Team Stats. Every figure is auto-calculated from game reports — nothing is typed here.
- **Varsity columns:** Player, #, Apps (1/half, max 2/game), G, A, Shots On, Shots Off, Shot%, Clear., Intercep., Tackles Won, Passes Comp., Passes Missed, Pass%, Saves, Clean Sheets, GAA, Cards.
- **Non-Varsity columns:** Player, #, G, A, Cards, Clean Sheets — by design, non-Varsity games collect only a scoring summary and discipline.
- Shot% = on ÷ (on + off). Pass% = completed ÷ (completed + missed). GAA = goals conceded in games the keeper appeared in ÷ those games. Clean Sheets = games the opponent scored zero.
- **Team Stats tab** — per-team card (Games Played, Shots/Game, Goals/Game, Total Attempts, Goal Conversion, Corners, Free Kicks, Fouls, Passes Completed, Possession %, Shots Conceded, Goals Conceded), location bars, and a per-game log whose action opens Update Result.

**Three denominators, stated not blended.** A game can be scored without its player table or team-stats section being filled in, so each average divides by the games that actually fed it: Goals/Game and Goals Conceded over games with a final score; Shots/Game and Goal Conversion over games with player stats; Corners, Fouls, Free Kicks, Possession % and Shots Conceded over games with team stats. Goal Conversion counts goals from the same games as its shots, so it can no longer exceed 100%.

**One way to count a goal.** A score entry's `team` field holds the *credited* team — that is what `derivedScores` and `playedGamesFor` read to produce the scoreline. `ownGoal` only records how the goal happened: it drives the "(OG)" label and keeps the scorer out of the per-player goals tally. Every team-level goal count in the hub, Goal Conversion included, is therefore `scores.filter(x => x.team === 'CHS').length` — own goals for CHS count toward CHS. Do not reintroduce a second rule here.

**One way to count a played game.** `derivedScores` (which produces every scoreline) and `aggregateTeam`'s `counted` (which feeds the Stats leaderboard) must agree on what "reported" means. A game enters the leaderboard if its report carries any content at all — a scoring summary, discipline, player stats, a confirmed 0–0 (`noGoals`), or a backfilled `finalChs`/`finalOpp`. Backfilled games are included deliberately, so a closed season's shutouts still credit the squad; they contribute nothing else, since there is no summary behind them. Clean sheets then re-check reported-ness per game and read goals conceded from the summary or from `finalOpp`. The card's footnote names all three counts, and an N/A means that section hasn't been logged rather than that the figure is zero.

### Team Goals
**Varsity only, and season-scoped.** Each goal carries a `seasonId`; the page shows the goals belonging to the season in the switcher, and Actual is calculated from that season's Varsity games. Closing a season no longer wipes the list — the new season simply starts with none, and the closed season keeps a record of what it aimed for and whether it got there. Goals stored before this change are stamped onto the open season on load and the stamp is **written back to storage** (`bootGoals`) — left in memory only, an unstamped goal would be re-stamped onto whichever season was open at the next load, so closing a season would drag its goals forward instead of leaving them on record against it.

Records with Description, Metric, Goal (benchmark), a calculated **Actual** and a **Status** verdict. Actual is never typed.

Metrics: # Wins, # Losses, # Ties, Win %, GF, Avg GF/Game, GA, Avg GA/Game, GD, Shutouts, # District Wins, # District Losses, District Record, Power Rating, Power Ranking.

**Status needs a direction per metric** (`GOAL_DIRECTION`), because "met" is not the same test for every one:
- *Higher is better* — # Wins, Win %, GF, Avg GF/Game, GD, Shutouts, # District Wins, Power Rating.
- *Lower is better* — # Losses, GA, Avg GA/Game, # District Losses, and **Power Ranking**, which is a position where 1st is the best possible (not to be confused with Power Rating, where higher is better).
- *No verdict* — # Ties. A tie target has no honest direction, so Status reads "—".
- *Compared as a record* — District Record. The target is typed whole ("5-1-0") and kept as a string rather than a number; it counts as met when the wins are at least the target and the losses no more than it. `RECORD_METRICS` drives the string handling, the "e.g. 5-1-0" placeholder and the validation.

The Status column made the table seven columns wide, so its `min-width` is 730px — enough for the coach-only Edit/Delete cell (`white-space:nowrap`) to lay out rather than overflow the table box and get sliced at the card edge. It carries the same mobile swipe hint as Overview and Results.

### Power Rankings (Varsity only)
Two tables.
- **Power Ratings** — per game: Game #, Opponent, Result, Pts Awarded, typed Opp W/L/T, then calculated Full Opp Pts, % Opp Pts, Opp Pts Awarded, Power Pts/Gm, running Total Power Pts, Power Rating.
- **Power Ranking Tracker** — Date, CHS Rank, CHS Power Rating, Positions from Last Playoff Position (`32 − rank`), Team Currently in Last Playoff Position, that team's Power Rating, and the Difference. Added via **Update PR Tracker**; both calculated fields preview live in the form.

### Roster
Cards with jersey, name, team/grade/class, positions, PIN, and a gold **Captain** badge. The player form has a **Team Captain this season** checkbox — more than one per team is fine.

### Staff
First Name, Last Name, E-Mail (optional), and a repeatable **Add Role** block. Each role is either a **School Administrator** (Team disabled; Position becomes Principal / Asst. Principal / Athletic Director / Faculty Rep.) or a Team + Position (Head Coach / Assistant Coach) pair. Old `{ title, teams }` records migrate to `roles` on load.

### Teams
Add/remove teams (Varsity is locked) and manage the **Opponents** list. An opponent that appears on any schedule can't be removed — rename instead. Consistent opponent names are what make head-to-head work across years.

### Seasons (coach-only)
One card per season, split by team:
- **Varsity block** — district record and finish in the header (with a gold District Champions badge when applicable), a Regular Season table, and a Playoffs table when there are playoff games.
- **One block per non-Varsity team**, each with its own + Add Game.
- **Individual Honors** for that season.

**Close Season** is a 4-step walkthrough:
1. The final record about to be snapshotted, plus a warning listing games with no result.
2. Final district standing (defaults to **Not recorded** so closing never declares a title by accident; 1st sets District Champions).
3. New season label, and what to copy onto its schedule — district games / every game / nothing. Copies clear the date and flip home/away.
4. Roster carry-forward, with 12th-graders pre-unticked, and a note naming the captains about to be recorded.

On finish: the season is snapshotted and closed; flagged captains are written into Individual Honors as "Team Captain" for that season and the flag clears; the roster carries over minus the unticked; staff, teams and opponents carry over untouched. Team goals are **not** reset — they stay attached to the season that set them, and the new season starts with none.

### Program History (coaches + players)
- **Season by Season** — record, win %, GF, GA, GD, shutouts, District (finish or Champions badge), Playoffs (deepest round + playoff W-L), status.
- **Team Records** — best win %, most goals scored, fewest goals allowed, most shutouts, biggest win, most district wins. Top 5 of completed seasons (`RECORDS_DEPTH`); the in-progress season is listed separately.
- **Individual Honors** — all-time, newest season first.
- **Head-to-Head** — one row per opponent: GP, all-time W-L-T, GF/GA, GD, streak, last meeting, last result, district flag.

### Availability
Coaches see the tracker only (players × upcoming events, RSVP pill per cell, legend, team filter). Player check-in lives in the player view.

Events come from the **real schedule**, scoped to the viewed season, filtered to the four committed types (Practice, Game, Scrimmage, Classroom Session — "Other" is excluded by choice). An event whose Team is **All** appears for every squad; a cell reads "—" where the event doesn't apply to that player's team.

**RSVPs persist** to `chsHubV1.rsvps` as `{ playerId: { eventId: 'Yes' | 'No' | 'Maybe' } }`; a missing entry is "No response". An RSVP **locks at the event's start time** (`eventStartMs` = date + start time), so the tracker and player check-in list upcoming events only and the attendance report can't move after the fact.

### Reports
Season-scoped to the season switcher — there is no date range picker. Attendance / Season Stats tabs, CSV and Print, and **Game Day Roster**: pick Team + Game, generate a print-formatted sheet with the CHS "C" logo, underlined title, matchup, MM/DD/YYYY date, kickoff time, location, the squad in two numbered columns by jersey ("Name - #7", with "(C)" for captains), then Head Coach, Assistant Coaches, Principal and Athletic Director. Print/Save as PDF works.

- **Attendance** reads the persisted RSVPs against the season's schedule, covering **only events that have already started**. Per event: Yes / No / Maybe / No Response / Yes %. Per player: Said Yes, Answered (of events that applied to them), No Response, Yes %.
- **Yes % = Yes ÷ answered.** A non-answer sits in its own column and never counts against the player — chosen deliberately so a player isn't punished for a coach forgetting to chase RSVPs.
- **Season Stats** renders one table per team, matching the Stats page. Varsity-only columns (Shot %, Pass %, GAA) are omitted from non-Varsity tables rather than showing N/A.
- **Export CSV** downloads whichever tab is showing, named for the viewed season. **Print / Save as PDF** prints `#report-print`; the roster sheet's own print handler hides that container first so the two print targets can't stack.

### Playoffs
Playoff games are schedule events with a `playoff` flag and a `playoffRound` (First Round / Regional / Quarterfinal / Semifinal / State Championship). Round, opponent, date, location and result all come from the game and its report — nothing is entered twice. Playoff games are excluded from regular-season game numbering, from the close-season schedule copy, from Power Ratings, and from Season Comparison. They ARE included in the headline season record. Game numbering is per season **per team**, regular season only.

---

## Verified formulas

### Power Ratings (per Varsity game, sorted by game number)
Opponent record (W/L/T) is typed; everything else calculated.
0. **Regular season only** — playoff games are excluded from the rating. The power rating is what determines playoff seeding, so playoff results must not feed the number that produced them.
1. **Pts Awarded** — Win 5, Draw 2.5, Loss 0
2. **Full Opp Pts** — `(oppWins × 1) + (oppTies × 0.5)`; opponent losses are deliberately ignored
3. **% Opp Pts** — Win 1.00, Draw 0.75, Loss 0.50
4. **Opp Pts Awarded** — Full Opp Pts × % Opp Pts
5. **Power Pts / Gm** — Pts Awarded + Opp Pts Awarded
6. **Total Power Pts** — running cumulative total across played games
7. **Power Rating** — Total Power Pts ÷ number of games actually played to that point

Scale note (accepted as intentional): Pts Awarded caps at 5 while Opp Pts Awarded grows with the opponent's win total, so opponent record carries more weight late in the season. This mirrors the state formula.

### Power Ranking Tracker
- Positions from Last Playoff Position = `32 − CHS Rank`
- Power Rating Difference = CHS Power Rating − Last Playoff Position Power Rating

---

## Visual system

**Palette** — Navy `#0A3868` (primary, headers, nav) · Tan/gold `#A1825D` (borders, accents, badges) · Page background `#FAF8F4` · Card border `#D9C9A8` · Body text `#1C1C1C` · Secondary `#6B6B6B` / `#4A4A4A` · Muted `#9B9B9B` · Non-Varsity table header `#4A6B93`.

**Status pills** — Confirmed/Win `#E7F3EA`/`#217A3B` · RSVP open `#FCF1D8`/`#8A6215`/`#C99A2E` · Cancelled/Loss `#FAE6E6`/`#B23B3B` · Postponed `#E3EBFA`/`#2B57A5` · TBD/Tie `#ECECEC`/`#6B6B6B`/`#9B9B9B`.

**Type** — Headings Georgia serif; body Helvetica Neue / Arial.

**Devices** — Coaches enter data and work on **desktop**. **Mobile** matters for player RSVPs, viewing the schedule, reading and posting announcements, and viewing results; those four flows were checked at 390px. Team Snapshot's nine-column grid scrolls horizontally **on mobile only** — `snapshotMinWidth` is `620px` under the 860px breakpoint and `0px` above it, so desktop keeps the fluid nine-column fit the row was tuned for while a phone scrolls instead of compressing to unreadable 15px columns. Do not make that min-width unconditional: at desktop widths between roughly 860px and 984px it silently clips the Pwr Rank column. RSVP buttons are 48px tall and split the row so they are thumb-sized. Wide tables on Overview and Results show a "swipe sideways" hint on mobile only. The Update Result player-stats grid is wide by design — it is a desktop task.

**Layout** — Navy sidebar (desktop) or slide-out drawer + top bar (mobile); Lions logo on a small white plate so the blue ring reads against navy; crest + address above the sign-in footer. Overview stacks Next Up above a full-width Team Snapshot (nine columns need the full width). Team filters are button toggles built from the Teams list; event type stays a dropdown.

---

## Go-live checklist (raw material for the runbook)
1. **Clear test data.** Every `chsHubV1.*` key, including the legacy three (`.results`, `.prevSeason`, `.playerStats`).
2. **Replace seed constants** in the logic: `SCHEDULE_RAW`, `ROSTER_RAW`, `STAFF_RAW`, `ANNOUNCEMENTS_RAW`, `GAME_REPORTS_SEED`, `TEAM_GAME_STATS_SEED`, `PLAYER_STATS_SEED`, `RESULTS_SEED`, `PREV_SEASON_SCHEDULE_RAW`, `AVAILABILITY_EVENTS_RAW`, `RSVP_RESPONSES_RAW`, `SCHOOL_LEADERSHIP`, `SCHOOL_YEAR_LABEL`.
3. **Set real PINs** for every coach and player (4 digits, unique).
4. **Set `DEMO_TODAY_ISO` to `''`** so the hub reads the real clock instead of the placeholder date, and confirm the live schedule has events in the future.
5. **Drop in images** — `chs-c-logo` slot on the Game Day Roster, `chs-crest` slot in the sidebar.
6. **Confirm the current season label** and that exactly one season is open.
7. **Delete dead seed constants** — `AVAILABILITY_EVENTS_RAW` is no longer read, and the legacy `.results`, `.prevSeason` and `.playerStats` keys can go.

---

## Known gaps / deliberate limits
- `AVAILABILITY_EVENTS_RAW` is now dead — Availability reads the real schedule. Delete it at go-live. `RSVP_RESPONSES_RAW` survives only as the seed for `.rsvps`.
- Non-Varsity games collect no per-player stats by design.
- Removing a team doesn't migrate existing roster/schedule/report records tagged with it.
- The `gameStats` modal kind is dead code since Team Stats moved into Update Result.
- All content is still placeholder ("Player 1", "Coach 1", "Opponent 5").
- Announcement timestamps are prose strings ("Today, 2:15 PM") rather than real dates, so they are not driven by `todayMs()` and the announcements preview is unsorted by date. Fine for placeholders; revisit if announcements need real ordering.

## Settled judgement calls (4 Sep 2026)
All five were put to the user and answered:
1. **District games** stay flagged by a checkbox on each schedule event — not inferred from the opponent list. A team can be in your district and still play you non-district.
2. **Staff PINs** stay auto-assigned. No PIN field on the form.
3. **Goal metrics** gained Shutouts, District Record and Power Ranking, which in turn required the Status column and `GOAL_DIRECTION` above.
4. **"Final [current season]"** in Season Comparison stays as it is, filling in as the season goes.
5. **Records depth** is now top 5, completed seasons only.
