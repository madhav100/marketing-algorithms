function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildTopology(nodes, topology, depth = 3) {
  const rnd = seededRandom(42);
  const positioned = nodes.map((id, i) => ({ id, i, x: 0, y: 0, z: 0 }));
  const n = positioned.length;

  if (topology === 'ring') {
    positioned.forEach((node, i) => {
      const angle = (Math.PI * 2 * i) / n;
      node.x = Math.cos(angle) * 18;
      node.y = Math.sin(angle) * 8;
      node.z = Math.sin(angle * 2) * depth;
    });
    return positioned;
  }

  if (topology === 'tree') {
    positioned.forEach((node, i) => {
      const layer = Math.floor(Math.log2(i + 1));
      const offset = i - (2 ** layer - 1);
      node.x = (offset - (2 ** (layer - 1) || 0)) * 3;
      node.y = layer * 3 - 10;
      node.z = (layer % 3) * depth;
    });
    return positioned;
  }

  if (topology === 'mesh') {
    const width = Math.ceil(Math.sqrt(n));
    positioned.forEach((node, i) => {
      const col = i % width;
      const row = Math.floor(i / width);
      node.x = (col - width / 2) * 4;
      node.y = (row - width / 2) * 2.2;
      node.z = ((col + row) % 5 - 2) * depth * 0.5;
    });
    return positioned;
  }

  if (topology === 'scale-free') {
    positioned.forEach((node, i) => {
      const r = Math.pow(rnd(), 0.35) * 20;
      const theta = rnd() * Math.PI * 2;
      const phi = rnd() * Math.PI;
      node.x = r * Math.sin(phi) * Math.cos(theta);
      node.y = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      node.z = r * Math.cos(phi) * 0.35;
      if (i < 6) {
        node.x *= 0.25;
        node.y *= 0.25;
      }
    });
    return positioned;
  }

  // hybrid
  positioned.forEach((node, i) => {
    const angle = (Math.PI * 2 * i) / n;
    const ring = 8 + (i % 4) * 3;
    node.x = Math.cos(angle) * ring + (rnd() - 0.5) * 2;
    node.y = Math.sin(angle) * (ring * 0.45) + (rnd() - 0.5) * 1.5;
    node.z = Math.sin(angle * 3) * depth + (i % 5) - 2;
  });

  return positioned;
}

module.exports = { buildTopology };
