#!/usr/bin/env python3
"""Render project progress data into SVG and PNG timeline charts."""

from __future__ import annotations

import json
import math
import struct
import zlib
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / 'docs' / 'project_progress.json'
SVG_PATH = ROOT / 'docs' / 'project_progress.svg'
PNG_PATH = ROOT / 'docs' / 'project_progress.png'

STATUS_COLORS = {
    'planned': '#94a3b8',
    'in_progress': '#f59e0b',
    'done': '#22c55e',
}
TODAY_COLOR = '#ef4444'
BACKGROUND = '#f8fafc'
GRID = '#cbd5e1'
TEXT = '#0f172a'
SUBTLE = '#475569'
BAR_BORDER = '#0f172a'

FONT_5X7: Dict[str, List[str]] = {
    ' ': ['00000'] * 7,
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
    '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
    'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    'C': ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    'D': ['11100', '10010', '10001', '10001', '10001', '10010', '11100'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    'G': ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    'I': ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
    'J': ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
    'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    'N': ['10001', '10001', '11001', '10101', '10011', '10001', '10001'],
    'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    'W': ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
}


@dataclass
class Milestone:
    id: str
    title: str
    start_date: date
    end_date: date
    status: str
    notes: str


class Canvas:
    def __init__(self, width: int, height: int, background: str) -> None:
        self.width = width
        self.height = height
        self.pixels = [hex_to_rgb(background)] * (width * height)

    def set_pixel(self, x: int, y: int, color: str) -> None:
        if 0 <= x < self.width and 0 <= y < self.height:
            self.pixels[y * self.width + x] = hex_to_rgb(color)

    def fill_rect(self, x: int, y: int, w: int, h: int, color: str) -> None:
        rgb = hex_to_rgb(color)
        for yy in range(max(0, y), min(self.height, y + h)):
            start = yy * self.width + max(0, x)
            end = yy * self.width + min(self.width, x + w)
            if start < end:
                self.pixels[start:end] = [rgb] * (end - start)

    def stroke_rect(self, x: int, y: int, w: int, h: int, color: str) -> None:
        self.fill_rect(x, y, w, 1, color)
        self.fill_rect(x, y + h - 1, w, 1, color)
        self.fill_rect(x, y, 1, h, color)
        self.fill_rect(x + w - 1, y, 1, h, color)

    def line(self, x1: int, y1: int, x2: int, y2: int, color: str) -> None:
        dx = abs(x2 - x1)
        dy = -abs(y2 - y1)
        sx = 1 if x1 < x2 else -1
        sy = 1 if y1 < y2 else -1
        err = dx + dy
        while True:
            self.set_pixel(x1, y1, color)
            if x1 == x2 and y1 == y2:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x1 += sx
            if e2 <= dx:
                err += dx
                y1 += sy

    def text(self, x: int, y: int, value: str, color: str, scale: int = 2) -> None:
        cursor = x
        for char in value.upper():
            glyph = FONT_5X7.get(char, FONT_5X7[' '])
            for row, bits in enumerate(glyph):
                for col, bit in enumerate(bits):
                    if bit == '1':
                        self.fill_rect(cursor + col * scale, y + row * scale, scale, scale, color)
            cursor += 6 * scale

    def save_png(self, path: Path) -> None:
        rows = []
        for y in range(self.height):
            row = bytearray([0])
            for x in range(self.width):
                row.extend(self.pixels[y * self.width + x])
            rows.append(bytes(row))
        raw = b''.join(rows)
        compressed = zlib.compress(raw, level=9)
        path.write_bytes(
            b'\x89PNG\r\n\x1a\n'
            + png_chunk(b'IHDR', struct.pack('!IIBBBBB', self.width, self.height, 8, 2, 0, 0, 0))
            + png_chunk(b'IDAT', compressed)
            + png_chunk(b'IEND', b'')
        )


def hex_to_rgb(value: str) -> Tuple[int, int, int]:
    value = value.lstrip('#')
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    return (
        struct.pack('!I', len(data))
        + chunk_type
        + data
        + struct.pack('!I', zlib.crc32(chunk_type + data) & 0xFFFFFFFF)
    )


def load_milestones() -> List[Milestone]:
    payload = json.loads(JSON_PATH.read_text())
    milestones: List[Milestone] = []
    for item in payload:
        start = datetime.strptime(item['start_date'], '%Y-%m-%d').date()
        end = datetime.strptime(item['end_date'] or item['start_date'], '%Y-%m-%d').date()
        milestones.append(
            Milestone(
                id=item['id'],
                title=item['title'],
                start_date=start,
                end_date=end,
                status=item['status'],
                notes=item['notes'],
            )
        )
    return milestones


def month_starts(start: date, end: date) -> Iterable[date]:
    cursor = date(start.year, start.month, 1)
    while cursor <= end:
        yield cursor
        if cursor.month == 12:
            cursor = date(cursor.year + 1, 1, 1)
        else:
            cursor = date(cursor.year, cursor.month + 1, 1)


def build_layout(milestones: List[Milestone]) -> dict:
    today = date.today()
    start = min(m.start_date for m in milestones)
    end = max(max(m.end_date for m in milestones), today)
    left = 300
    top = 110
    right = 60
    row_h = 52
    bar_h = 26
    chart_w = 1100
    width = left + chart_w + right
    height = top + row_h * len(milestones) + 100
    total_days = (end - start).days or 1

    def x_for(day: date) -> int:
        return left + round(((day - start).days / total_days) * chart_w)

    return {
        'today': today,
        'start': start,
        'end': end,
        'left': left,
        'top': top,
        'right': right,
        'row_h': row_h,
        'bar_h': bar_h,
        'chart_w': chart_w,
        'width': width,
        'height': height,
        'x_for': x_for,
    }


def render_svg(milestones: List[Milestone], layout: dict) -> None:
    x_for = layout['x_for']
    lines: List[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{layout["width"]}" height="{layout["height"]}" viewBox="0 0 {layout["width"]} {layout["height"]}">',
        f'<rect width="100%" height="100%" fill="{BACKGROUND}"/>',
        f'<text x="24" y="36" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="{TEXT}">Project Evolution Timeline</text>',
        f'<text x="24" y="64" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="{SUBTLE}">From repository creation to the current committed state.</text>',
    ]

    # Legend
    legend_x = layout['width'] - 320
    legend_y = 24
    for index, status in enumerate(['done', 'in_progress', 'planned']):
        y = legend_y + index * 22
        lines.append(f'<rect x="{legend_x}" y="{y}" width="14" height="14" rx="3" fill="{STATUS_COLORS[status]}" stroke="{BAR_BORDER}" stroke-width="1"/>')
        lines.append(f'<text x="{legend_x + 22}" y="{y + 12}" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="{TEXT}">{status.replace("_", " ").title()}</text>')
    lines.append(f'<line x1="{legend_x}" y1="{legend_y + 76}" x2="{legend_x + 14}" y2="{legend_y + 76}" stroke="{TODAY_COLOR}" stroke-width="3"/>')
    lines.append(f'<text x="{legend_x + 22}" y="{legend_y + 80}" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="{TEXT}">Today</text>')

    # Month grid
    axis_y = layout['top'] - 26
    for month in month_starts(layout['start'], layout['end']):
        x = x_for(month)
        lines.append(f'<line x1="{x}" y1="{layout["top"] - 10}" x2="{x}" y2="{layout["height"] - 50}" stroke="{GRID}" stroke-width="1" stroke-dasharray="4 4"/>')
        lines.append(f'<text x="{x + 4}" y="{axis_y}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="{SUBTLE}">{month.strftime("%Y-%m")}</text>')

    # Today line
    today_x = x_for(layout['today'])
    lines.append(f'<line x1="{today_x}" y1="{layout["top"] - 14}" x2="{today_x}" y2="{layout["height"] - 50}" stroke="{TODAY_COLOR}" stroke-width="2"/>')
    lines.append(f'<text x="{today_x + 6}" y="{layout["height"] - 22}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="{TODAY_COLOR}">Today ({layout["today"].isoformat()})</text>')

    for index, milestone in enumerate(milestones):
        y = layout['top'] + index * layout['row_h']
        bar_y = y + 8
        lines.append(f'<text x="24" y="{y + 24}" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="{TEXT}">{escape_xml(milestone.title)}</text>')
        lines.append(f'<text x="24" y="{y + 42}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="{SUBTLE}">{milestone.start_date.isoformat()} → {milestone.end_date.isoformat()}</text>')
        lines.append(f'<line x1="{layout["left"]}" y1="{y + layout["row_h"]}" x2="{layout["width"] - layout["right"]}" y2="{y + layout["row_h"]}" stroke="#e2e8f0" stroke-width="1"/>')
        x1 = x_for(milestone.start_date)
        x2 = max(x1 + 6, x_for(milestone.end_date + timedelta(days=1)))
        lines.append(
            f'<rect x="{x1}" y="{bar_y}" width="{x2 - x1}" height="{layout["bar_h"]}" rx="6" fill="{STATUS_COLORS[milestone.status]}" stroke="{BAR_BORDER}" stroke-width="1.2"/>'
        )
        lines.append(f'<text x="{x1 + 8}" y="{bar_y + 17}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="{TEXT}">{milestone.status.replace("_", " ").title()}</text>')

    lines.append('</svg>')
    SVG_PATH.write_text('\n'.join(lines))


def render_png(milestones: List[Milestone], layout: dict) -> None:
    canvas = Canvas(layout['width'], layout['height'], BACKGROUND)
    x_for = layout['x_for']

    canvas.text(24, 24, 'PROJECT EVOLUTION TIMELINE', TEXT, scale=3)
    canvas.text(24, 60, 'FROM REPOSITORY CREATION TO CURRENT STATE', SUBTLE, scale=2)

    legend_x = layout['width'] - 320
    legend_y = 24
    legend_items = [('DONE', STATUS_COLORS['done']), ('IN PROGRESS', STATUS_COLORS['in_progress']), ('PLANNED', STATUS_COLORS['planned'])]
    for index, (label, color) in enumerate(legend_items):
        y = legend_y + index * 22
        canvas.fill_rect(legend_x, y, 14, 14, color)
        canvas.stroke_rect(legend_x, y, 14, 14, BAR_BORDER)
        canvas.text(legend_x + 22, y + 2, label, TEXT, scale=2)
    canvas.line(legend_x, legend_y + 76, legend_x + 14, legend_y + 76, TODAY_COLOR)
    canvas.line(legend_x, legend_y + 77, legend_x + 14, legend_y + 77, TODAY_COLOR)
    canvas.text(legend_x + 22, legend_y + 70, 'TODAY', TEXT, scale=2)

    for month in month_starts(layout['start'], layout['end']):
        x = x_for(month)
        for y in range(layout['top'] - 10, layout['height'] - 50, 8):
            canvas.line(x, y, x, min(y + 3, layout['height'] - 50), GRID)
        canvas.text(x + 4, layout['top'] - 34, month.strftime('%Y-%m'), SUBTLE, scale=2)

    today_x = x_for(layout['today'])
    canvas.line(today_x, layout['top'] - 14, today_x, layout['height'] - 50, TODAY_COLOR)
    canvas.line(today_x + 1, layout['top'] - 14, today_x + 1, layout['height'] - 50, TODAY_COLOR)
    canvas.text(today_x + 8, layout['height'] - 34, f'TODAY {layout["today"].isoformat()}', TODAY_COLOR, scale=2)

    short_titles = {
        'Repository Initialization': 'REPOSITORY INITIALIZATION',
        'SFRA Foundation': 'SFRA FOUNDATION',
        'Walmart Storefront Skeleton': 'WALMART STOREFRONT SKELETON',
        'Retail UI and Assets': 'RETAIL UI AND ASSETS',
        'Admin Console Architecture': 'ADMIN CONSOLE ARCHITECTURE',
        'Integration Server Layer': 'INTEGRATION SERVER LAYER',
        'Shared Catalog and Cart': 'SHARED CATALOG AND CART',
    }

    for index, milestone in enumerate(milestones):
        y = layout['top'] + index * layout['row_h']
        bar_y = y + 8
        canvas.text(24, y + 10, short_titles.get(milestone.title, milestone.title.upper()), TEXT, scale=2)
        canvas.text(24, y + 30, f'{milestone.start_date.isoformat()}-{milestone.end_date.isoformat()}', SUBTLE, scale=2)
        canvas.line(layout['left'], y + layout['row_h'], layout['width'] - layout['right'], y + layout['row_h'], '#e2e8f0')
        x1 = x_for(milestone.start_date)
        x2 = max(x1 + 6, x_for(milestone.end_date + timedelta(days=1)))
        canvas.fill_rect(x1, bar_y, x2 - x1, layout['bar_h'], STATUS_COLORS[milestone.status])
        canvas.stroke_rect(x1, bar_y, x2 - x1, layout['bar_h'], BAR_BORDER)
        canvas.text(x1 + 8, bar_y + 6, milestone.status.replace('_', ' ').upper(), TEXT, scale=2)

    canvas.save_png(PNG_PATH)


def escape_xml(value: str) -> str:
    return (
        value.replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('"', '&quot;')
        .replace("'", '&apos;')
    )


def main() -> None:
    milestones = load_milestones()
    layout = build_layout(milestones)
    render_svg(milestones, layout)
    render_png(milestones, layout)
    print('How to run: python tools/render_progress_chart.py')
    print(f'SVG saved to: {SVG_PATH.relative_to(ROOT)}')
    print(f'PNG saved to: {PNG_PATH.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
