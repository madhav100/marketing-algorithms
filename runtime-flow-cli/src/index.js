#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { CORE_FLOW } = require('./flowCatalog');
const { buildTopology } = require('./topologies');

function parseArgs(argv) {
  const args = { topology: 'hybrid', fps: 20, depth: 3, trace: '', dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--topology') args.topology = argv[++i] || args.topology;
    else if (a === '--fps') args.fps = Number(argv[++i] || args.fps);
    else if (a === '--depth') args.depth = Number(argv[++i] || args.depth);
    else if (a === '--trace') args.trace = argv[++i] || '';
    else if (a === '--dry-run') args.dryRun = true;
  }
  return args;
}

function buildGraph(baseFlow) {
  const nodes = new Set();
  const edges = [];
  for (const [from, to] of baseFlow) {
    nodes.add(from);
    nodes.add(to);
    edges.push({ from, to, weight: 1, pulse: 0 });
  }
  return { nodes: [...nodes], edges };
}

function project(node, width, height, angle) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const x = node.x * cos - node.z * sin;
  const z = node.x * sin + node.z * cos;
  const y = node.y;
  const d = 30;
  const f = d / (d + z + 20);
  return {
    sx: Math.round(width / 2 + x * f * 2.3),
    sy: Math.round(height / 2 + y * f * 1.2),
    depth: z,
  };
}

function linePoints(x0, y0, x1, y1) {
  const points = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;

  while (true) {
    points.push([x, y]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return points;
}

function renderFrame(graph, positioned, frameNo, opts, liveEvents) {
  const width = process.stdout.columns || 140;
  const height = Math.max(30, (process.stdout.rows || 40) - 4);
  const grid = Array.from({ length: height }, () => Array(width).fill(' '));
  const pmap = new Map();
  const angle = frameNo * 0.04;

  positioned.forEach((node) => pmap.set(node.id, project(node, width, height, angle)));

  graph.edges.forEach((edge) => {
    const a = pmap.get(edge.from);
    const b = pmap.get(edge.to);
    if (!a || !b) return;

    const isLive = edge.pulse > 0;
    const char = isLive ? '*' : (Math.abs(a.depth - b.depth) > 6 ? ':' : '.');
    linePoints(a.sx, a.sy, b.sx, b.sy).forEach(([x, y]) => {
      if (x >= 0 && x < width && y >= 0 && y < height) grid[y][x] = char;
    });

    edge.pulse = Math.max(0, edge.pulse - 0.08);
  });

  positioned.forEach((node) => {
    const p = pmap.get(node.id);
    if (!p) return;
    if (p.sx >= 0 && p.sx < width && p.sy >= 0 && p.sy < height) {
      grid[p.sy][p.sx] = '●';
    }
  });

  const legend = ` Runtime Flow 3D | topology=${opts.topology} | nodes=${graph.nodes.length} edges=${graph.edges.length} | liveEvents=${liveEvents.length} `;
  const top = legend.slice(0, width - 1);
  for (let i = 0; i < top.length; i += 1) grid[0][i] = top[i];

  const out = '\x1b[H' + grid.map((r) => r.join('')).join('\n');
  process.stdout.write(out);
}

function addOrPulseEdge(graph, from, to, weight = 1) {
  let edge = graph.edges.find((e) => e.from === from && e.to === to);
  if (!edge) {
    graph.nodes.push(from, to);
    edge = { from, to, weight, pulse: 1 };
    graph.edges.push(edge);
  }
  edge.pulse = Math.min(1, edge.pulse + 0.7);
}

function tailTrace(tracePath, onEvent) {
  if (!tracePath) return () => {};
  const abs = path.resolve(tracePath);
  let cursor = 0;

  return setInterval(() => {
    if (!fs.existsSync(abs)) return;
    const stat = fs.statSync(abs);
    if (stat.size <= cursor) return;
    const fd = fs.openSync(abs, 'r');
    const chunk = Buffer.alloc(stat.size - cursor);
    fs.readSync(fd, chunk, 0, stat.size - cursor, cursor);
    fs.closeSync(fd);
    cursor = stat.size;

    chunk.toString('utf8').split('\n').filter(Boolean).forEach((line) => {
      try {
        const evt = JSON.parse(line);
        if (evt.from && evt.to) onEvent(evt);
      } catch (err) {
        // ignore malformed lines
      }
    });
  }, 250);
}

function main() {
  const opts = parseArgs(process.argv);
  const graph = buildGraph(CORE_FLOW);
  let positioned = buildTopology(graph.nodes, opts.topology, opts.depth);
  const liveEvents = [];

  if (opts.dryRun) {
    console.log(JSON.stringify({
      topology: opts.topology,
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      trace: opts.trace || null,
    }, null, 2));
    return;
  }

  process.stdout.write('\x1b[2J\x1b[?25l');
  const cleanup = () => {
    process.stdout.write('\x1b[?25h\n');
    process.exit(0);
  };
  process.on('SIGINT', cleanup);

  const traceTimer = tailTrace(opts.trace, (evt) => {
    liveEvents.push(evt);
    addOrPulseEdge(graph, evt.from, evt.to, evt.weight || 1);
    positioned = buildTopology(graph.nodes, opts.topology, opts.depth);
  });

  let frame = 0;
  const demoTimer = setInterval(() => {
    const [from, to] = CORE_FLOW[frame % CORE_FLOW.length];
    addOrPulseEdge(graph, from, to, 1);
    renderFrame(graph, positioned, frame, opts, liveEvents);
    frame += 1;
  }, Math.max(20, Math.floor(1000 / Math.max(2, opts.fps))));

  process.on('exit', () => {
    if (demoTimer) clearInterval(demoTimer);
    if (traceTimer) clearInterval(traceTimer);
  });
}

main();
