/** @typedef {import('../types.js').IsoPoint} IsoPoint */
/** @typedef {import('../types.js').NavNode} NavNode */

const keyOf = (point) => `${Math.round(point.x)}:${Math.round(point.y)}`;

const neighborOffsets = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
];

export class NavMesh {
  constructor(points) {
    this.nodes = new Map();
    points.forEach((point) => {
      const key = keyOf(point);
      if (!this.nodes.has(key)) {
        this.nodes.set(key, { id: key, point: { x: Math.round(point.x), y: Math.round(point.y) }, neighbors: [] });
      }
    });
    this.nodes.forEach((node) => {
      neighborOffsets.forEach((offset) => {
        const neighborKey = keyOf({
          x: node.point.x + offset.x,
          y: node.point.y + offset.y,
        });
        if (this.nodes.has(neighborKey)) {
          node.neighbors.push(neighborKey);
        }
      });
    });
  }

  findNearest(point) {
    const rounded = { x: Math.round(point.x), y: Math.round(point.y) };
    const node = this.nodes.get(keyOf(rounded));
    if (node) {
      return node;
    }
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;
    this.nodes.forEach((candidate) => {
      const dx = candidate.point.x - point.x;
      const dy = candidate.point.y - point.y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = candidate;
      }
    });
    return best;
  }

  findPath(from, to) {
    const start = this.findNearest(from);
    const end = this.findNearest(to);
    if (!start || !end) {
      return [];
    }
    if (start.id === end.id) {
      return [end.point];
    }
    const queue = [start.id];
    const visited = new Set([start.id]);
    const cameFrom = new Map();
    cameFrom.set(start.id, null);

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) {
        break;
      }
      if (currentId === end.id) {
        break;
      }
      const currentNode = this.nodes.get(currentId);
      if (!currentNode) {
        continue;
      }
      currentNode.neighbors.forEach((neighbor) => {
        if (visited.has(neighbor)) {
          return;
        }
        visited.add(neighbor);
        queue.push(neighbor);
        cameFrom.set(neighbor, currentId);
      });
    }

    const path = [];
    let current = end.id;
    while (current) {
      const node = this.nodes.get(current);
      if (!node) {
        break;
      }
      path.push(node.point);
      current = cameFrom.get(current) ?? null;
    }
    return path.reverse();
  }
}
