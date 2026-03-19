# walmart_evo

This folder now owns the repository's project-evolution deliverables.

## Metadata-first outputs

The timeline is now maintained as structured metadata first, with a generated Markdown summary alongside it:

- `walmart_evo/project_timeline.json` — canonical milestone metadata
- `walmart_evo/project_timeline.md` — generated human-readable summary
- `tools/generate_project_timeline.py` — generator for the Markdown summary

## Why the chart workflow was removed

The previous implementation centered on generated SVG/PNG artifacts under `docs/`. That flow has been retired in favor of reviewable text-based assets that diff cleanly in pull requests and keep the milestone record in one canonical JSON document.

## Regenerating the summary

Run:

```bash
python tools/generate_project_timeline.py
```
