/**
 * Boda Logistics Engine 2025
 * Specialized routing for high-density informal settlements.
 */

export type NodeType = 'HUB' | 'DROP_OFF' | 'INTERSECTION';
export type PathType = 'MAIN_ROAD' | 'ALLEY' | 'NARROW_PASSAGE' | 'UNPAVED';

interface Edge {
  to: string;
  distance: number; // in meters
  type: PathType;
  congestionFactor: number; // 1.0 = clear, 2.0 = heavy traffic
}

interface GraphNode {
  id: string;
  lat: number;
  lng: number;
  type: NodeType;
  edges: Edge[];
}

export class BodaRouter {
  private graph: Map<string, GraphNode> = new Map();

  constructor() {}

  addNode(node: GraphNode) {
    this.graph.set(node.id, node);
  }

  /**
   * Calculates the optimal route using a modified Dijkstra's algorithm.
   * Accounts for motorcycle maneuverability in narrow alleys.
   */
  calculateRoute(startId: string, endId: string): { path: string[]; time: number; distance: number } {
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const queue: string[] = [];

    this.graph.forEach((_, id) => {
      distances[id] = Infinity;
      previous[id] = null;
      queue.push(id);
    });

    distances[startId] = 0;

    while (queue.length > 0) {
      queue.sort((a, b) => distances[a] - distances[b]);
      const u = queue.shift()!;

      if (u === endId) break;

      const node = this.graph.get(u);
      if (!node) continue;

      for (const edge of node.edges) {
        // Boda-specific logic: Motorcycles are 30% faster in 'ALLEY' than cars 
        // but 10% slower in 'UNPAVED' areas compared to 'MAIN_ROAD'.
        const agilityMultiplier = edge.type === 'ALLEY' ? 0.7 : edge.type === 'UNPAVED' ? 1.1 : 1.0;
        const weight = edge.distance * edge.congestionFactor * agilityMultiplier;
        
        const alt = distances[u] + weight;
        if (alt < distances[edge.to]) {
          distances[edge.to] = alt;
          previous[edge.to] = u;
        }
      }
    }

    const path: string[] = [];
    let curr: string | null = endId;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }

    return {
      path,
      time: distances[endId], // Estimated weighted travel time units
      distance: this.calculateTotalDistance(path)
    };
  }

  private calculateTotalDistance(path: string[]): number {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const node = this.graph.get(path[i]);
      const edge = node?.edges.find(e => e.to === path[i + 1]);
      if (edge) total += edge.distance;
    }
    return total;
  }
}

// Example Usage
const router = new BodaRouter();
router.addNode({
  id: "KIBERA_ENTRY",
  lat: -1.313,
  lng: 36.788,
  type: "HUB",
  edges: [
    { to: "ALLEY_A", distance: 150, type: "ALLEY", congestionFactor: 1.1 },
    { to: "MAIN_RD_1", distance: 500, type: "MAIN_ROAD", congestionFactor: 2.5 }
  ]
});
router.addNode({ id: "ALLEY_A", lat: -1.314, lng: 36.789, type: "INTERSECTION", edges: [{ to: "DEST_1", distance: 100, type: "NARROW_PASSAGE", congestionFactor: 1.0 }] });
router.addNode({ id: "MAIN_RD_1", lat: -1.315, lng: 36.790, type: "INTERSECTION", edges: [{ to: "DEST_1", distance: 400, type: "MAIN_ROAD", congestionFactor: 1.5 }] });
router.addNode({ id: "DEST_1", lat: -1.316, lng: 36.791, type: "DROP_OFF", edges: [] });

console.log("Optimized Boda Route:", router.calculateRoute("KIBERA_ENTRY", "DEST_1"));