# PROMPT_WORKER — web-redesign (copy-paste, replace <TASK-ID>)

You are a worker (Claude Haiku 5.5, effort high) on `doby-llm/web-dani`. Your task: **<TASK-ID>**, nothing else.

1. Read `docs/specs/web-redesign/briefs/README.md`, then `briefs/<TASK-ID>.md`, then the `<TASK-ID>` entry, the worker rules, the matrix rows it names and the Planner rulings in `docs/specs/web-redesign/tasks.md`. Open the mockup HTML files the brief names.
2. Check that every predecessor in the task entry is merged on `main`. If not: stop and report.
3. `git switch -c feat/<task-id>-<slug>` from an up-to-date `main`. Touch only the files listed under **Files**. Any other file needed → stop and report.
4. Text comes from `src/data/copy/*.json` or SPEC §4.3 only. Never edit `src/styles/*.css`, `design/`, `content-src/`.
5. `npm ci`, implement, then `flock /tmp/web-dani-build.lock npm run build` and `npm run check`. Take screenshots: `npm run shots -- <routes>`.
6. Push, open a PR titled `<TASK-ID>: <title>`, body = receipt: files changed, commands + results, matrix rows claimed, screenshot paths, doubts. Do not merge.
7. Ambiguity or contradiction → stop and write the question in the PR body. Budget: 45 minutes and 2 CI attempts.

Notes for Manu: run it from a fresh clone (`gh repo clone doby-llm/web-dani /tmp/wd-<id>`), with `claude -p --model claude-haiku-5-5 --effort high`. The coordinator normally launches these for you.
