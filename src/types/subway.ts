// ─── 역 노드 ─────────────────────────────────────────────────────────────────
export interface StationNode {
  /** "강남_2" — 역명 + 호선번호 (환승역 구분용) */
  id: string;
  name: string;
  line: number;
  /** 노선 표시명 — "2호선", "경의중앙선", "공항철도" 등 */
  lineName: string;
  lat: number;
  lng: number;
}

// ─── 역 간 간선 ───────────────────────────────────────────────────────────────
export interface StationEdge {
  fromId: string;
  toId: string;
  /** 소요시간(분), 소수점 가능 (1분30초 → 1.5) */
  travelMin: number;
  distKm: number;
  isTransfer: boolean;
  /** csv: 실제 CSV 데이터 / estimated-json: JSON 위상 기반 추정 / estimated-order: MOLIT 순번 기반 추정 */
  source: 'csv' | 'estimated-json' | 'estimated-order' | 'transfer';
}

// ─── 그래프 전체 ──────────────────────────────────────────────────────────────
export interface SubwayGraphData {
  stations: StationNode[];
  edges: StationEdge[];
  /** "강남" → ["강남_2"]  / "왕십리" → ["왕십리_2", "왕십리_5"] */
  nameIndex: Record<string, string[]>;
}

// ─── 추천 결과 ────────────────────────────────────────────────────────────────
export interface CandidateStation {
  rank: number;           // 1 = 최우선 추천, 2·3 = 대안
  stationId: string;      // "왕십리_2"
  stationName: string;    // "왕십리"
  line: number;           // 2
  lineName: string;       // "2호선" | "경의중앙선"
  lat: number;
  lng: number;
  durationFromA: number;  // 출발지 A → 후보역 최단 소요시간(분)
  durationFromB: number;  // 출발지 B → 후보역 최단 소요시간(분)
  avgDuration: number;    // (durationFromA + durationFromB) / 2
  score: number;          // 낮을수록 좋음
  /** 출발지 A → 추천역 경로 요약 (출발역, 환승역, 도착역) */
  routeFromA?: string[];
  /** 출발지 B → 추천역 경로 요약 */
  routeFromB?: string[];
}
