import { SUBWAY_GRAPH } from '../data/subwayGraph';
import type { StationNode, StationEdge, SubwayGraphData } from '../types/subway';

// ─── 그래프 인터페이스 ─────────────────────────────────────────────────────────

export interface SubwayGraph {
  /** 역 ID로 노드 조회 — O(1) */
  getStation(id: string): StationNode | undefined;
  /** 역 ID의 인접 edge 목록 조회 — O(1) */
  getNeighbors(id: string): StationEdge[];
  /** 역명으로 모든 노선의 StationNode 반환 — O(1) (환승역 포함) */
  findByName(name: string): StationNode[];
  /** 전체 역 목록 (Dijkstra 결과 순회용) */
  readonly stations: readonly StationNode[];
  /** 역 총 수 */
  readonly stationCount: number;
  /** edge 총 수 (undirected 기준) */
  readonly edgeCount: number;
}

// ─── 그래프 빌드 ──────────────────────────────────────────────────────────────

export function buildGraph(data: SubwayGraphData): SubwayGraph {
  // ① 역 Map: id → StationNode  (O(1) 조회)
  const stationMap = new Map<string, StationNode>();
  for (const station of data.stations) {
    stationMap.set(station.id, station);
  }

  // ② Adjacency list: id → StationEdge[]  (양방향, O(1) 조회)
  const adj = new Map<string, StationEdge[]>();

  // 모든 역에 빈 배열 초기화 (고립 노드도 포함)
  for (const station of data.stations) {
    adj.set(station.id, []);
  }

  // undirected edge → 양방향으로 삽입
  for (const edge of data.edges) {
    adj.get(edge.fromId)?.push(edge);
    adj.get(edge.toId)?.push({
      fromId: edge.toId,
      toId: edge.fromId,
      travelMin: edge.travelMin,
      distKm: edge.distKm,
      isTransfer: edge.isTransfer,
      source: edge.source,
    });
  }

  // ③ 이름 인덱스: name → StationNode[]  (O(1) 조회)
  const nameMap = new Map<string, StationNode[]>();
  for (const [name, ids] of Object.entries(data.nameIndex)) {
    nameMap.set(
      name,
      ids.map(id => stationMap.get(id)).filter((s): s is StationNode => s !== undefined)
    );
  }

  return {
    getStation: (id) => stationMap.get(id),
    getNeighbors: (id) => adj.get(id) ?? [],
    findByName: (name) => nameMap.get(name.replace(/역$/, '')) ?? [],
    stations: data.stations,
    stationCount: stationMap.size,
    edgeCount: data.edges.length,
  };
}

// ─── 싱글턴 (앱 전역에서 재사용) ─────────────────────────────────────────────

export const GRAPH = buildGraph(SUBWAY_GRAPH);

// ─── 디버그 로그 ──────────────────────────────────────────────────────────────

export function logGraphStats(graph: SubwayGraph, sampleStationId = '강남_2'): void {
  const isDebug = import.meta.env.VITE_DEBUG === 'true';
  if (!isDebug) return;

  console.group('[graphBuilder] 그래프 생성 완료');
  console.log(`  역 수:      ${graph.stationCount}`);
  console.log(`  edge 수:    ${graph.edgeCount} (undirected)`);

  // 예시 노드 인접 리스트
  const sample = graph.getStation(sampleStationId);
  const neighbors = graph.getNeighbors(sampleStationId);

  if (sample) {
    console.group(`  [예시] ${sample.name} (${sample.line}호선) 인접역`);
    for (const edge of neighbors) {
      const neighbor = graph.getStation(edge.toId);
      const label = edge.isTransfer ? '환승' : `${edge.travelMin}분 / ${edge.distKm}km`;
      console.log(`    → ${neighbor?.name ?? edge.toId} (${neighbor?.line}호선) [${label}]`);
    }
    console.groupEnd();
  }

  // 환승역 목록 (인접 edge 중 isTransfer=true 가 있는 역)
  const transferStations = SUBWAY_GRAPH.stations.filter((st) =>
    graph.getNeighbors(st.id).some((e) => e.isTransfer)
  );
  console.log(`  환승역 수:  ${transferStations.length}`);

  // 고립 노드 (edge 없음 — CSV 미매칭 구간)
  const isolated = SUBWAY_GRAPH.stations.filter(
    (st) => graph.getNeighbors(st.id).length === 0
  );
  console.log(`  고립 노드:  ${isolated.length} (CSV 미포함 구간)`);

  console.groupEnd();
}
