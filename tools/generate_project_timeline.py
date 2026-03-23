#!/usr/bin/env python3
"""Generate the Walmart evolution markdown summary from metadata."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / 'walmart_evo' / 'project_timeline.json'
OUTPUT_PATH = ROOT / 'walmart_evo' / 'project_timeline.md'


def render_markdown(payload: dict) -> str:
    lines: list[str] = []
    title = payload['title']
    lines.append(f'# {title}')
    lines.append('')
    lines.append(payload['summary'])
    lines.append('')

    lines.append('## Timeline Metadata')
    lines.append('')
    metadata = payload.get('metadata', {})
    for key, value in metadata.items():
        label = key.replace('_', ' ').title()
        lines.append(f'- **{label}:** {value}')
    lines.append('')

    lines.append('## Milestones')
    lines.append('')
    for index, milestone in enumerate(payload['milestones'], start=1):
        lines.append(f"{index}. **{milestone['title']}** (`{milestone['start_date']}` → `{milestone['end_date']}`)")
        lines.append(f"   - Status: `{milestone['status']}`")
        lines.append(f"   - Notes: {milestone['notes']}")
        lines.append('   - Evidence:')
        for evidence in milestone['evidence']:
            commits = ', '.join(f'`{commit}`' for commit in evidence['commits'])
            lines.append(f"     - `{evidence['path']}` via {commits}")
        if milestone.get('derived_from'):
            lines.append(f"   - Derived from: {milestone['derived_from']}")
        lines.append('')

    sections = payload.get('sections', {})
    for heading in ['current_state', 'next_steps']:
        entries = sections.get(heading)
        if not entries:
            continue
        lines.append(f"## {heading.replace('_', ' ').title()}")
        lines.append('')
        for entry in entries:
            lines.append(f'- {entry}')
        lines.append('')

    lines.append('## Outputs')
    lines.append('')
    outputs = payload.get('outputs', {})
    for label, path in outputs.items():
        lines.append(f'- **{label.replace("_", " ").title()}:** `{path}`')
    lines.append('')

    return '\n'.join(lines).rstrip() + '\n'


def main() -> None:
    payload = json.loads(DATA_PATH.read_text())
    OUTPUT_PATH.write_text(render_markdown(payload))
    print(f'Wrote {OUTPUT_PATH.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
