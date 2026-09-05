---
name: wrap-session
description: Wrap up a Claude Code working session on the chsboyssoccer repo by syncing project documentation with what actually changed, then committing and pushing to origin/main. Trigger this whenever the user runs "/wrap-session" or says something like "wrap up the session", "wrap this up", "let's stop for the day", "save and push before we go", or otherwise signals they're ending a session and want docs and git history left in a clean, accurate state.
---

# Wrap Session

Run this at the end of a working session so nothing from the session is lost:
the docs describe reality, and the repo's git history has it too.

## 1. Find out what actually changed

Run `git status` and `git diff` (both staged and unstaged) to see every file
touched this session. Also think back over the conversation for decisions or
state changes that never produced a diff — e.g. "the Supabase project moved
to org X," "Phase 1 is now deployed," "the Vercel project lives under a
different account" — those belong in the docs even though no file changed
because of them.

## 2. Update project documentation — but not the frozen design spec

Update **README.md** (and any other top-level project docs — anything
outside `design/`) so they accurately describe the current state: what's
built, what's deployed vs. only working locally, what's still pending, and
any setup step a new contributor or a future session would need to know
about. If the repo has a "Status" section tracking phase progress, that's
usually the thing most worth keeping current.

**Do not edit anything under `design/`.** That directory is a frozen
historical specification — its own README states the design is complete and
describes what the rebuild should produce, not what has been built so far.
It documents intent, not progress. If something happens during a session
that genuinely calls the design's intent into question (rare — this is
different from "we haven't built that part yet"), flag it to the user in
conversation rather than silently editing those files.

Keep edits factual and terse, like a changelog entry, not a narrative. Don't
mark something as done, deployed, or verified unless it actually was this
session — an inaccurate status is worse than no status.

## 3. Review before staging

Run `git status` again after the doc edits. Look at the full diff of
everything about to be committed — check for anything that looks like a
secret (API keys, tokens, `.env` contents, connection strings) even in a
file whose name looks harmless, and exclude it if you find it. Prefer
staging specific files over a blind `git add -A` if `git status` shows
anything unexpected or unfamiliar.

## 4. Commit and push

Stage the relevant files, write a commit message that summarizes what the
session actually accomplished (not "wrap session" — describe the real
work, matching this repo's normal commit style), and push to `origin/main`.
Use the standard attribution trailer this project's commits already use.

If `git status` is clean after the documentation sync (nothing to commit),
say so and stop — don't create an empty commit, and don't push if there's
nothing new to push.

## 5. Confirm back to the user

Report concisely: what changed in the docs, what got committed (one-line
summary), and that `origin/main` is up to date. Keep it short — this is a
wrap-up, not a report.
