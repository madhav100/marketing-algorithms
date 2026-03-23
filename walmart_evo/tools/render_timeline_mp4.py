#!/usr/bin/env python3
"""Render the expanded project timeline into an MP4 fly-through.

This renderer intentionally uses only the Python standard library and an
external `ffmpeg` binary. Frames are generated in-memory as PPM images and
streamed directly to ffmpeg, so no image dependencies are required.
"""

from __future__ import annotations

import argparse
import math
import re
import shutil
import subprocess
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Iterable

TIMELINE_PATTERN = re.compile(
    r"^(T\d{4}) \| (\d{4}-\d{2}-\d{2}) \| ([A-Z]+) \| ([a-z_]+) \| ([^|]+) \| (.+)$"
)

PHASE_COLORS = {
    "INIT": (243, 196, 83),
    "SFRA": (85, 171, 244),
    "WALMART": (37, 211, 102),
    "UI": (150, 117, 248),
    "ADMIN": (255, 138, 101),
    "SERVER": (98, 198, 255),
    "DATA": (89, 215, 191),
    "CART": (255, 110, 196),
    "DOCS": (255, 214, 92),
    "TOOLING": (182, 189, 206),
}

KIND_PRIORITY = {
    "gap": 0,
    "snapshot": 1,
    "commit": 2,
    "file": 3,
}

FONT_5X7 = {
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
    "/": ["00001", "00010", "00100", "01000", "10000", "00000", "00000"],
    ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
    "#": ["01010", "11111", "01010", "01010", "11111", "01010", "00000"],
    "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
    ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
    ",": ["00000", "00000", "00000", "00000", "01100", "01100", "11000"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    "J": ["00001", "00001", "00001", "00001", "10001", "10001", "01110"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
}


@dataclass(frozen=True)
class TimelineEvent:
    code: str
    date: date
    phase: str
    kind: str
    source: str
    detail: str


class Canvas:
    def __init__(self, width: int, height: int, background: tuple[int, int, int]) -> None:
        self.width = width
        self.height = height
        self.pixels = bytearray(background * width * height)

    def fill_rect(self, x: int, y: int, w: int, h: int, color: tuple[int, int, int]) -> None:
        x0 = max(0, x)
        y0 = max(0, y)
        x1 = min(self.width, x + w)
        y1 = min(self.height, y + h)
        if x0 >= x1 or y0 >= y1:
            return
        row = bytes(color * (x1 - x0))
        stride = self.width * 3
        for yy in range(y0, y1):
            start = yy * stride + x0 * 3
            self.pixels[start:start + len(row)] = row

    def draw_pixel(self, x: int, y: int, color: tuple[int, int, int]) -> None:
        if 0 <= x < self.width and 0 <= y < self.height:
            idx = (y * self.width + x) * 3
            self.pixels[idx:idx + 3] = bytes(color)

    def draw_line(self, x1: int, y1: int, x2: int, y2: int, color: tuple[int, int, int], thickness: int = 1) -> None:
        dx = x2 - x1
        dy = y2 - y1
        steps = max(abs(dx), abs(dy), 1)
        for step in range(steps + 1):
            x = round(x1 + dx * step / steps)
            y = round(y1 + dy * step / steps)
            self.fill_rect(x - thickness // 2, y - thickness // 2, thickness, thickness, color)

    def draw_text(
        self,
        x: int,
        y: int,
        text: str,
        color: tuple[int, int, int],
        scale: int = 2,
        max_chars: int | None = None,
    ) -> None:
        prepared = prepare_text(text)
        if max_chars is not None:
            prepared = prepared[:max_chars]
        cursor_x = x
        for char in prepared:
            glyph = FONT_5X7.get(char, FONT_5X7[" "])
            for row_index, row_bits in enumerate(glyph):
                for col_index, bit in enumerate(row_bits):
                    if bit == "1":
                        self.fill_rect(
                            cursor_x + col_index * scale,
                            y + row_index * scale,
                            scale,
                            scale,
                            color,
                        )
            cursor_x += (5 + 1) * scale

    def to_ppm(self) -> bytes:
        header = f"P6\n{self.width} {self.height}\n255\n".encode("ascii")
        return header + bytes(self.pixels)


def prepare_text(text: str) -> str:
    text = text.upper()
    return "".join(char if char in FONT_5X7 else " " for char in text)


def parse_timeline(path: Path) -> list[TimelineEvent]:
    events: list[TimelineEvent] = []
    for line in path.read_text().splitlines():
        match = TIMELINE_PATTERN.match(line.strip())
        if not match:
            continue
        code, event_date, phase, kind, source, detail = match.groups()
        events.append(
            TimelineEvent(
                code=code,
                date=datetime.strptime(event_date, "%Y-%m-%d").date(),
                phase=phase,
                kind=kind,
                source=source.strip(),
                detail=detail.strip(),
            )
        )
    if not events:
        raise ValueError(f"No timeline events found in {path}")
    return events


def filter_events(events: list[TimelineEvent], include_files: bool, max_events: int) -> list[TimelineEvent]:
    filtered = [event for event in events if include_files or event.kind != "file"]
    filtered.sort(key=lambda item: (item.date, KIND_PRIORITY.get(item.kind, 9), item.code))
    if len(filtered) <= max_events:
        return filtered

    stride = max(1, math.ceil(len(filtered) / max_events))
    sampled = filtered[::stride]
    if sampled[-1] != filtered[-1]:
        sampled.append(filtered[-1])
    return sampled[:max_events]


def phase_counts(events: Iterable[TimelineEvent]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for event in events:
        counts[event.phase] = counts.get(event.phase, 0) + 1
    return counts


def blend(color: tuple[int, int, int], factor: float) -> tuple[int, int, int]:
    return tuple(max(0, min(255, int(channel * factor))) for channel in color)


def frame_for_progress(
    width: int,
    height: int,
    events: list[TimelineEvent],
    progress: float,
    title: str,
) -> Canvas:
    background = (7, 10, 20)
    canvas = Canvas(width, height, background)
    horizon = int(height * 0.28)
    center_x = width // 2
    bottom_y = height - 40

    for band in range(height):
        tint = int(10 + 25 * band / max(1, height - 1))
        canvas.fill_rect(0, band, width, 1, (background[0], background[1] + tint // 4, background[2] + tint // 2))

    canvas.draw_line(center_x - 220, bottom_y, center_x - 30, horizon, (45, 80, 120), 3)
    canvas.draw_line(center_x + 220, bottom_y, center_x + 30, horizon, (45, 80, 120), 3)
    canvas.draw_line(center_x, bottom_y, center_x, horizon, (65, 110, 170), 2)

    total_days = max(1, (events[-1].date - events[0].date).days)
    camera_day = progress * total_days
    visible_window = 120.0

    for event in events:
        event_day = (event.date - events[0].date).days
        distance = event_day - camera_day
        if distance < -8 or distance > visible_window:
            continue
        depth = 0.65 + distance / 22.0
        if depth <= 0:
            continue
        scale = 1.0 / depth
        if scale < 0.12:
            continue

        side = -1 if int(event.code[1:]) % 2 == 0 else 1
        lane_offset = side * (155 / depth)
        screen_x = int(center_x + lane_offset)
        screen_y = int(horizon + (1.5 - min(scale, 1.5)) / 1.4 * (bottom_y - horizon))
        panel_width = max(78, int(210 * scale))
        panel_height = max(40, int(86 * scale))
        left = screen_x - panel_width // 2
        top = screen_y - panel_height // 2
        base_color = PHASE_COLORS.get(event.phase, (180, 180, 180))
        shadow_color = blend(base_color, 0.25)
        fill_color = blend(base_color, 0.62 + min(scale, 1.0) * 0.45)
        accent_color = blend(base_color, 1.05)

        canvas.fill_rect(left + 4, top + 5, panel_width, panel_height, shadow_color)
        canvas.fill_rect(left, top, panel_width, panel_height, (12, 18, 34))
        canvas.fill_rect(left + 2, top + 2, panel_width - 4, panel_height - 4, fill_color)
        canvas.fill_rect(left + 2, top + 2, panel_width - 4, max(4, panel_height // 7), accent_color)

        text_scale = max(1, int(1 + scale * 2.0))
        canvas.draw_text(left + 8, top + 8, event.code, (5, 8, 18), text_scale, max_chars=6)
        canvas.draw_text(left + 8, top + 20 + text_scale * 2, event.phase, (255, 255, 255), text_scale, max_chars=10)
        canvas.draw_text(left + 8, top + 34 + text_scale * 4, event.date.isoformat(), (235, 245, 255), text_scale, max_chars=10)
        summary = event.detail.split(" in ")[0]
        canvas.draw_text(left + 8, top + panel_height - 14 - text_scale * 7, summary, (255, 255, 255), text_scale, max_chars=max(10, panel_width // (6 * text_scale)))

    counts = phase_counts(events)
    now_date = events[0].date + timedelta(days=round(camera_day))
    canvas.fill_rect(20, 18, width - 40, 54, (10, 17, 31))
    canvas.fill_rect(24, 22, width - 48, 46, (20, 32, 58))
    canvas.draw_text(34, 30, title, (255, 255, 255), 3, max_chars=34)
    canvas.draw_text(34, 52, f"DATE {now_date.isoformat()}  EVENTS {len(events)}", (171, 215, 255), 2, max_chars=44)

    canvas.fill_rect(width - 210, 24, 170, 94, (10, 17, 31))
    canvas.fill_rect(width - 206, 28, 162, 86, (17, 26, 46))
    canvas.draw_text(width - 195, 36, "PHASE MIX", (255, 255, 255), 2, max_chars=10)
    ordered_phases = sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:4]
    for index, (phase, count) in enumerate(ordered_phases):
        phase_color = PHASE_COLORS.get(phase, (180, 180, 180))
        row_y = 54 + index * 14
        canvas.fill_rect(width - 195, row_y, 12, 8, phase_color)
        canvas.draw_text(width - 176, row_y - 2, f"{phase} {count}", (235, 245, 255), 1, max_chars=18)

    progress_width = width - 80
    progress_y = height - 22
    canvas.fill_rect(40, progress_y, progress_width, 8, (28, 40, 68))
    canvas.fill_rect(40, progress_y, max(1, int(progress_width * progress)), 8, (99, 196, 255))
    canvas.draw_text(42, progress_y - 16, f"RANGE {events[0].date.isoformat()} TO {events[-1].date.isoformat()}", (196, 222, 255), 1, max_chars=64)
    return canvas


def render_video(
    timeline_path: Path,
    output_path: Path,
    width: int,
    height: int,
    fps: int,
    duration: int,
    include_files: bool,
    max_events: int,
    title: str,
) -> None:
    events = parse_timeline(timeline_path)
    render_events = filter_events(events, include_files=include_files, max_events=max_events)

    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        raise SystemExit(
            "ffmpeg was not found on PATH. Install ffmpeg, then rerun this script to create the MP4 output."
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    frame_total = max(1, fps * duration)
    command = [
        ffmpeg,
        "-y",
        "-f",
        "image2pipe",
        "-vcodec",
        "ppm",
        "-r",
        str(fps),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        str(output_path),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    for frame_index in range(frame_total):
        progress = frame_index / max(1, frame_total - 1)
        canvas = frame_for_progress(width, height, render_events, progress, title)
        process.stdin.write(canvas.to_ppm())
    process.stdin.close()
    return_code = process.wait()
    if return_code != 0:
        raise SystemExit(f"ffmpeg exited with status {return_code}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Render docs/project_timeline_expanded.md into an MP4 fly-through.")
    parser.add_argument(
        "--timeline",
        type=Path,
        default=Path("docs/project_timeline_expanded.md"),
        help="Timeline markdown file to parse.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("walmart_evo/docs/project_timeline_flythrough.mp4"),
        help="Output MP4 path.",
    )
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--fps", type=int, default=15)
    parser.add_argument("--duration", type=int, default=12, help="Video duration in seconds.")
    parser.add_argument(
        "--include-files",
        action="store_true",
        help="Include file-level timeline lines instead of only commits/gaps/snapshots.",
    )
    parser.add_argument(
        "--max-events",
        type=int,
        default=90,
        help="Maximum number of events to render after filtering/sampling.",
    )
    parser.add_argument(
        "--title",
        default="MARKETING ALGORITHMS TIMELINE",
        help="Overlay title to draw in the video.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse/filter the timeline and print render metadata without invoking ffmpeg.",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    events = parse_timeline(args.timeline)
    render_events = filter_events(events, include_files=args.include_files, max_events=args.max_events)

    if args.dry_run:
        print(f"timeline={args.timeline}")
        print(f"parsed_events={len(events)}")
        print(f"render_events={len(render_events)}")
        print(f"date_range={render_events[0].date.isoformat()}..{render_events[-1].date.isoformat()}")
        print(f"output={args.output}")
        return

    render_video(
        timeline_path=args.timeline,
        output_path=args.output,
        width=args.width,
        height=args.height,
        fps=args.fps,
        duration=args.duration,
        include_files=args.include_files,
        max_events=args.max_events,
        title=args.title,
    )
    print(f"wrote {args.output}")


if __name__ == "__main__":
    main()
