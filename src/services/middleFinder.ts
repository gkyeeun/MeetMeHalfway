import { GRAPH } from './graphBuilder';
import type { CandidateStation } from '../types/subway';

// ─── Priority Queue (Min-Heap) ────────────────────────────────────────────────

interface HeapItem { id: string; dist: number; transfers: number; }

class MinHeap {
  private data: HeapItem[] = [];
  get size(): number { return this.data.length; }
  isEmpty(): boolean { return this.data.length === 0; }

  push(item: HeapItem): void {
    this.data.push(item);
    this.up(this.data.length - 1);
  }

  pop(): HeapItem {
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) { this.data[0] = last; this.down(0); }
    return top;
  }

  private up(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p].dist <= this.data[i].dist) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }

  private down(i: number): void {
    const n = this.data.length;
    while (true) {
      let min = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l].dist < this.data[min].dist) min = l;
      if (r < n && this.data[r].dist < this.data[min].dist) min = r;
      if (min === i) break;
      [this.data[min], this.data[i]] = [this.data[i], this.data[min]];
      i = min;
    }
  }
}

// ─── Dijkstra (prev 추적 포함) ────────────────────────────────────────────────

interface NodeResult {
  dist: number;
  transfers: number;
  prev: string | null; // 최단경로 직전 노드 ID
}

function dijkstra(startIds: string[]): Map<string, NodeResult> {
  const result = new Map<string, NodeResult>();
  const pq = new MinHeap();

  for (const id of startIds) {
    result.set(id, { dist: 0, transfers: 0, prev: null });
    pq.push({ id, dist: 0, transfers: 0 });
  }

  while (!pq.isEmpty()) {
    const { id, dist, transfers } = pq.pop();
    const best = result.get(id);
    if (best && dist > best.dist) continue;

    for (const edge of GRAPH.getNeighbors(id)) {
      const newDist      = dist + edge.travelMin;
      const newTransfers = transfers + (edge.isTransfer ? 1 : 0);
      const cur = result.get(edge.toId);

      if (!cur || newDist < cur.dist) {
        result.set(edge.toId, { dist: newDist, transfers: newTransfers, prev: id });
        pq.push({ id: edge.toId, dist: newDist, transfers: newTransfers });
      }
    }
  }

  return result;
}

// ─── 경로 복원 ─────────────────────────────────────────────────────────────────

function reconstructPath(
  result: Map<string, NodeResult>,
  targetId: string,
): string[] {
  const path: string[] = [];
  let cur: string | null = targetId;
  const seen = new Set<string>();

  while (cur !== null && !seen.has(cur)) {
    seen.add(cur);
    path.unshift(cur);
    cur = result.get(cur)?.prev ?? null;
  }
  return path;
}

/** 전체 경로에서 출발역·환승역·도착역만 추출 */
function summarizePath(pathIds: string[]): string[] {
  if (pathIds.length === 0) return [];

  const getName = (id: string) => id.slice(0, id.lastIndexOf('_'));
  const getLine = (id: string) => id.slice(id.lastIndexOf('_') + 1);

  const key: string[] = [];
  let prevLine = '';

  for (let i = 0; i < pathIds.length; i++) {
    const name = getName(pathIds[i]);
    const line = getLine(pathIds[i]);
    const isEndpoint = i === 0 || i === pathIds.length - 1;
    const lineChanged = line !== prevLine && prevLine !== '';

    if (isEndpoint || lineChanged) {
      if (key.length === 0 || key[key.length - 1] !== name) key.push(name);
    }
    prevLine = line;
  }

  return key;
}

// ─── 점수 계산 ────────────────────────────────────────────────────────────────
//
// score = avgTime*0.5 + spread*0.3 + tieredTransferPenalty
//       - hubBonus  (환승 허브일수록 유리)
//       + remotePenalty (평균 60분 초과 시 소폭 패널티)
//
// transfer penalty (비선형): 0회→0  1회→+1  2회→+3  3회+→+6

function tieredTransferPenalty(avgTransfers: number): number {
  if (avgTransfers < 0.5) return 0;
  if (avgTransfers < 1.5) return 1;
  if (avgTransfers < 2.5) return 3;
  return 6;
}

function calcScore(
  durations: number[],
  transfers: number[],
  lineCount: number,
): number {
  const n             = durations.length;
  const avgTime       = durations.reduce((a, b) => a + b, 0) / n;
  const maxTime       = Math.max(...durations);
  const spread        = maxTime - Math.min(...durations);
  const avgTransfers  = transfers.reduce((a, b) => a + b, 0) / n;
  const tPenalty      = tieredTransferPenalty(avgTransfers);
  const hubBonus      = (lineCount - 1) * 3.5;
  const remotePenalty = Math.max(0, (avgTime - 60) * 0.05);
  return avgTime * 0.5 + spread * 0.3 + tPenalty - hubBonus + remotePenalty;
}

// ─── 메인 함수 ────────────────────────────────────────────────────────────────

export function findMiddleStations(
  originNames: string[],
): CandidateStation[] {
  const originNodeGroups = originNames.map(name => GRAPH.findByName(name));

  for (let i = 0; i < originNames.length; i++) {
    if (originNodeGroups[i].length === 0) {
      console.error(`[middleFinder] 역 미발견: "${originNames[i]}"`);
      return [];
    }
  }

  const dijkstraResults = originNodeGroups.map(nodes => dijkstra(nodes.map(n => n.id)));
  const allStartIds = new Set(originNodeGroups.flat().map(n => n.id));
  const bestByName = new Map<string, CandidateStation>();

  for (const station of GRAPH.stations) {
    if (allStartIds.has(station.id)) continue;

    const nodeResults = dijkstraResults.map(res => res.get(station.id));
    if (nodeResults.some(r => !r)) continue;

    const durations  = nodeResults.map(r => r!.dist);
    const transfers  = nodeResults.map(r => r!.transfers);
    const lineCount  = GRAPH.findByName(station.name).length;
    const score      = calcScore(durations, transfers, lineCount);

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);

    const prev = bestByName.get(station.name);
    if (!prev || score < prev.score) {
      bestByName.set(station.name, {
        rank:              0,
        stationId:         station.id,
        stationName:       station.name,
        line:              station.line,
        lineName:          station.lineName,
        lat:               station.lat,
        lng:               station.lng,
        durationsByOrigin: durations.map(round1),
        routesByOrigin:    [],
        avgDuration:       round1(avg),
        maxDuration:       round1(max),
        spread:            round1(max - min),
        score:             round1(score),
      });
    }
  }

  // 점수 순 정렬 후 노선 다양성 고려하여 3개 선발
  const sorted = [...bestByName.values()].sort((a, b) => a.score - b.score);
  const selected: typeof sorted = [];
  for (const c of sorted) {
    if (selected.length >= 3) break;
    const tooSimilar = selected.some(s =>
      s.line === c.line && Math.abs(s.avgDuration - c.avgDuration) < 8,
    );
    if (!tooSimilar) selected.push(c);
  }
  for (const c of sorted) {
    if (selected.length >= 3) break;
    if (!selected.find(s => s.stationId === c.stationId)) selected.push(c);
  }

  return selected.map((c, i) => ({
    ...c,
    rank: i + 1,
    routesByOrigin: dijkstraResults.map(res =>
      summarizePath(reconstructPath(res, c.stationId))
    ),
  }));
}

function round1(n: number): number { return Math.round(n * 10) / 10; }

// ─── 테스트 ───────────────────────────────────────────────────────────────────

export function testMiddleFinder(...originNames: string[]): void {
  console.group(`\n[middleFinder] ${originNames.map(n => `"${n}"`).join(' → ')}`);
  const t0 = performance.now();
  const results = findMiddleStations(originNames);
  console.log(`${(performance.now() - t0).toFixed(1)}ms`);

  for (const r of results) {
    console.log(`${r.rank}위 ${r.stationName}(${r.lineName}) score=${r.score} avg=${r.avgDuration}분 spread=${r.spread}분`);
    r.durationsByOrigin.forEach((d, i) => {
      console.log(`  [${i}] ${originNames[i]} ${d}분 경로: ${r.routesByOrigin[i]?.join(' → ')}`);
    });
  }
  console.groupEnd();
}
