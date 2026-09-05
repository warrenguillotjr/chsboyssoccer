---
name: start-session
description: Start a Claude Code working session on the chsboyssoccer repo by reading the project's documentation and recent git history, then giving a short summary of what the last session accomplished plus a recommended, ordered list of next steps. Trigger this whenever the user runs "/start-session" or says something like "catch me up", "what's the status", "where did we leave off", "what should I work on next", or is clearly resuming work after a break.
---

# Start Session

Orient at the start of a session: figure out what happened last time and
what to do next, without making the user re-explain it.

## 1. Gather sources, most-authoritative first

1. `git log --oneline -20` and `git log -1 --stat` — ground truth for what
   actually shipped, and when.
2. `git status` — anything uncommitted left over from last time. That's a
   strong signal the last session ended mid-task, or that `/wrap-session`
   wasn't run before stopping.
3. **README.md** — read in full, especially any "Status" or "next steps"
   section. This is the durable, human-curated summary of where the
   project stands, kept current by `/wrap-session`.
4. Any other top-level `*.md` files this project maintains outside
   `design/` — check what actually exists, don't assume a CHANGELOG or
   similar exists if it doesn't.
5. `design/` is the frozen spec bundle — skim it only if you need to
   understand what an upcoming step actually involves (e.g. what Phase 2
   requires), never as a source of session history. It documents intent,
   not progress, and is never updated by session work.

## 2. Reconcile, don't just repeat

Cross-check README's stated status against the actual git log and
`git status`. If they agree, summarize confidently. If they disagree — say,
README calls something "pending" that a recent commit clearly finished, or
there's uncommitted work the docs don't mention — say so explicitly rather
than repeating a stale claim. The user needs to know when docs and reality
have drifted, not just get the docs read back to them.

Also watch for a blocker mentioned in conversation-adjacent places (a
commit message, a TODO, a "still having trouble with X" note) that never
made it into README's status — that's exactly the kind of thing worth
surfacing first, since it's the most likely thing to still be in the way.

## 3. Report back

Give a short, two-part answer:

**Last session:** 2-4 sentences on what was actually accomplished (from git
history + README), plus anything left unresolved or in progress. If
there's an unresolved blocker, lead with it — it's the thing most likely
to matter first today.

**Next steps:** A short ordered list — most-blocking first — of what to do
next, drawing on whatever roadmap or phase plan the docs describe. Briefly
explain *why* that order (e.g. "this has to happen before B can work," "this
unblocks everything else"), not just a bare list. Only surface what's
actually next — don't dump an entire multi-phase roadmap when just the next
step or two is relevant right now.

Keep the whole thing tight: this is a quick orientation, not a full status
report. If the user wants more detail on any item, they'll ask for it.
