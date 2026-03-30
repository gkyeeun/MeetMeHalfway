/**
 * scripts/buildSubwayData.mjs
 *
 * 지하철 원본 데이터를 파싱해 src/data/subwayGraph.ts 를 생성합니다.
 *
 * 입력:
 *   data/data-metro-line-1.0.0.json                       — 노선 위상 (위경도 + 인접역 연결)
 *   data/서울교통공사 역간거리 및 소요시간_240810.csv         — 역간 소요시간/거리 (EUC-KR, 1~8호선)
 *   data/국토교통부_도시철도 전체노선_20241211.csv            — 수도권 역 순번 (EUC-KR, 검증용)
 *
 * Edge 소스:
 *   csv             — 서울교통공사 CSV 실측값
 *   estimated-json  — JSON 위상 기반 하버사인 추정 (CSV 미포함 구간)
 *   estimated-order — MOLIT 순번 인접 기반 추정 (JSON 위상 누락 구간 보완)
 *
 * 실행: node scripts/buildSubwayData.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const DATA_DIR  = join(ROOT, 'data');
const OUT_DIR   = join(ROOT, 'src/data');

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function readEucKr(filename) {
  const buf = readFileSync(join(DATA_DIR, filename));
  return new TextDecoder('euc-kr').decode(buf);
}

/** "01:30" → 1.5 (분) */
function parseMMSS(str) {
  const [mm, ss] = str.trim().split(':').map(Number);
  return mm + (isNaN(ss) ? 0 : ss) / 60;
}

/** "강남_2" / "탄현_114" → { name: "강남", line: 2 } */
function parseId(id) {
  const sep = id.lastIndexOf('_');
  return { name: id.slice(0, sep), line: parseInt(id.slice(sep + 1)) };
}

/** 하버사인 거리 (km) */
function haversine(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos(lat1 * Math.PI / 180)
             * Math.cos(lat2 * Math.PI / 180)
             * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 거리(km) → 추정 소요시간(분) */
function estimatedMin(distKm) {
  return Math.max(1, distKm * 1.8);
}

/** MOLIT 역명 정규화 — "사상(서부터미널)" → "사상" */
function normalizeMolitName(name) {
  return name.replace(/\s*\(.*?\)/g, '').trim();
}

// ─── 노선 설정 ─────────────────────────────────────────────────────────────────
//   lineNum  : ID에 사용되는 정수 (역 고유 식별)
//   lineName : 표시용 노선명
//   molitName: MOLIT CSV "노선명" 컬럼 값

const LINE_CONFIG = {
  '1호선':       { lineNum: 1,   lineName: '1호선',       molitName: '1호선' },
  '2호선':       { lineNum: 2,   lineName: '2호선',       molitName: '2호선' },
  '3호선':       { lineNum: 3,   lineName: '3호선',       molitName: '3호선' },
  '4호선':       { lineNum: 4,   lineName: '4호선',       molitName: '4호선' },
  '5호선':       { lineNum: 5,   lineName: '5호선',       molitName: '5호선' },
  '6호선':       { lineNum: 6,   lineName: '6호선',       molitName: '6호선' },
  '7호선':       { lineNum: 7,   lineName: '7호선',       molitName: '7호선' },
  '8호선':       { lineNum: 8,   lineName: '8호선',       molitName: '8호선' },
  '9호선':       { lineNum: 9,   lineName: '9호선',       molitName: '9호선' },
  '인천1호선':   { lineNum: 10,  lineName: '인천1호선',   molitName: '인천1호선' },
  '인천2호선':   { lineNum: 11,  lineName: '인천2호선',   molitName: '인천2호선' },
  '경강선':      { lineNum: 12,  lineName: '경강선',      molitName: '경강' },
  '경의중앙선':  { lineNum: 13,  lineName: '경의중앙선',  molitName: '경의중앙' },
  '경춘선':      { lineNum: 14,  lineName: '경춘선',      molitName: '경춘' },
  '공항철도':    { lineNum: 15,  lineName: '공항철도',    molitName: '공항' },
  '서해선':      { lineNum: 16,  lineName: '서해선',      molitName: '서해선' },
  '수인분당선':  { lineNum: 17,  lineName: '수인분당선',  molitName: '수인분당' },
  '신분당선':    { lineNum: 18,  lineName: '신분당선',    molitName: '신분당' },
  '신림선':      { lineNum: 19,  lineName: '신림선',      molitName: '신림선' },
  '우이신설선':  { lineNum: 20,  lineName: '우이신설선',  molitName: '우이신설' },
  '김포골드라인':{ lineNum: 21,  lineName: '김포골드라인',molitName: '김포골드라인' },
  '용인에버라인':{ lineNum: 22,  lineName: '용인에버라인',molitName: '에버라인' },
  '의정부경전철':{ lineNum: 23,  lineName: '의정부경전철',molitName: '의정부' },
  'GTXA':       { lineNum: 24,  lineName: 'GTX-A',       molitName: 'GTX-A' },
};

const CSV_LINES = new Set([1, 2, 3, 4, 5, 6, 7, 8]); // 서울교통공사 CSV 적용 호선
const TRANSFER_MIN = 3;

// ─── Step 1. JSON 파싱: 모든 노선의 역 + 위상 ─────────────────────────────────

console.log('\n[1] JSON 파싱 중 (전체 노선)...');

const jsonData = JSON.parse(
  readFileSync(join(DATA_DIR, 'data-metro-line-1.0.0.json'), 'utf-8')
);

/** id → { name, line, lineName, lat, lng } */
const stationMeta = new Map();

/**
 * 중복 없는 양방향 edge 집합
 * key: "idA|||idB" (정렬된 canonical key)
 */
const jsonEdgeSet = new Set();

/** lineNum → line name (로그용) */
const lineNumToName = new Map();

for (const lineData of jsonData.DATA) {
  const cfg = LINE_CONFIG[lineData.line];
  if (!cfg) {
    console.warn(`  [skip] LINE_CONFIG 미등록 노선: ${lineData.line}`);
    continue;
  }
  const { lineNum, lineName } = cfg;
  lineNumToName.set(lineNum, lineName);

  for (const node of lineData.node) {
    const [stA, stB] = node.station;
    const idA = `${stA.name}_${lineNum}`;
    const idB = `${stB.name}_${lineNum}`;

    if (!stationMeta.has(idA)) {
      stationMeta.set(idA, { name: stA.name, line: lineNum, lineName, lat: stA.lat, lng: stA.lng });
    }
    if (!stationMeta.has(idB)) {
      stationMeta.set(idB, { name: stB.name, line: lineNum, lineName, lat: stB.lat, lng: stB.lng });
    }

    jsonEdgeSet.add([idA, idB].sort().join('|||'));
  }
}

// 노선별 역 수 집계
const perLineCount = new Map();
for (const [, meta] of stationMeta) {
  perLineCount.set(meta.line, (perLineCount.get(meta.line) || 0) + 1);
}

console.log(`  전체 역 수: ${stationMeta.size}`);
console.log(`  전체 위상 edge 수: ${jsonEdgeSet.size}`);
for (const [ln, cnt] of [...perLineCount.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`    ${lineNumToName.get(ln)}: ${cnt}역`);
}

// ─── Step 2. 서울교통공사 CSV: 1~8호선 역간 소요시간 ─────────────────────────

console.log('\n[2] 서울교통공사 CSV (소요시간) 파싱 중...');

/**
 * key: "${lineNum}_${nameA}_${nameB}"
 * value: { travelMin, distKm }
 */
const csvEdgeMap = new Map();

const csvTime   = readEucKr('서울교통공사 역간거리 및 소요시간_240810.csv');
const timeRows  = csvTime.split('\n').map(r => r.trim()).filter(Boolean);
const prevStn   = {}; // lineNum → 직전 역명

for (let i = 1; i < timeRows.length; i++) {
  const cols = timeRows[i].split(',');
  if (cols.length < 6) continue;

  const lineNum = parseInt(cols[1]);
  if (!CSV_LINES.has(lineNum)) continue;

  const name    = cols[2].trim();
  const minutes = parseMMSS(cols[3]);
  const km      = parseFloat(cols[4]);

  if (minutes > 0 && prevStn[lineNum]) {
    const key = `${lineNum}_${prevStn[lineNum]}_${name}`;
    csvEdgeMap.set(key, { travelMin: minutes, distKm: km });
  }
  prevStn[lineNum] = name;
}

console.log(`  소요시간 edge 수 (1~8호선): ${csvEdgeMap.size}`);

// ─── Step 3. MOLIT CSV: 수도권 노선 역 순번 인덱스 ────────────────────────────

console.log('\n[3] MOLIT CSV (수도권 전체노선) 파싱 중...');

/**
 * MOLIT 순번 인덱스
 * key: molitName (노선명)
 * value: Map< normalizedStationName, seq >
 */
const molitSeqMap = new Map();  // molitName → Map<normName, seq>

/**
 * MOLIT 순번 → 역명 (역방향)
 * key: molitName
 * value: Map< seq, normName >
 */
const molitSeqToName = new Map(); // molitName → Map<seq, normName>

const csvMolit = readEucKr('국토교통부_도시철도 전체노선_20241211.csv');
const molitRows = csvMolit.split('\n').map(r => r.trim()).filter(Boolean).slice(1);

for (const row of molitRows) {
  const cols = row.split(',');
  if (cols.length < 6) continue;
  if (cols[0].trim() !== '01') continue; // 수도권만

  const molitName = cols[3].trim();
  const seq       = parseInt(cols[4].trim());
  const rawName   = cols[5].trim();
  const normName  = normalizeMolitName(rawName);

  if (!molitSeqMap.has(molitName)) {
    molitSeqMap.set(molitName, new Map());
    molitSeqToName.set(molitName, new Map());
  }
  molitSeqMap.get(molitName).set(normName, seq);
  molitSeqToName.get(molitName).set(seq, normName);
}

console.log(`  수도권 노선 수: ${molitSeqMap.size}`);
for (const [name, seqMap] of molitSeqMap) {
  console.log(`    ${name}: ${seqMap.size}역`);
}

// ─── Step 4. JSON edge + CSV 소요시간 조인 → 가중치 edge 구성 ─────────────────

console.log('\n[4] Edge 조인 중...');

const edges        = [];
let cntCsv         = 0;
let cntEstJson     = 0;

for (const edgeKey of jsonEdgeSet) {
  const [idA, idB] = edgeKey.split('|||');
  const { name: nameA, line } = parseId(idA);
  const { name: nameB }       = parseId(idB);
  const metaA = stationMeta.get(idA);
  const metaB = stationMeta.get(idB);

  if (!metaA || !metaB) continue;

  // CSV 소요시간 매칭 (1~8호선만 해당)
  const csvMatch =
    (CSV_LINES.has(line))
      ? csvEdgeMap.get(`${line}_${nameA}_${nameB}`) ||
        csvEdgeMap.get(`${line}_${nameB}_${nameA}`)
      : null;

  if (csvMatch) {
    edges.push({
      fromId: idA, toId: idB,
      travelMin: csvMatch.travelMin,
      distKm:    csvMatch.distKm,
      isTransfer: false,
      source: 'csv',
    });
    cntCsv++;
  } else {
    const dist = haversine(metaA.lat, metaA.lng, metaB.lat, metaB.lng);
    edges.push({
      fromId: idA, toId: idB,
      travelMin: estimatedMin(dist),
      distKm:    Math.round(dist * 100) / 100,
      isTransfer: false,
      source: 'estimated-json',
    });
    cntEstJson++;
  }
}

console.log(`  csv edge:            ${cntCsv}`);
console.log(`  estimated-json edge: ${cntEstJson}`);

// ─── Step 5. MOLIT 순번 기반 fallback edge (JSON 위상 누락 보완) ──────────────

console.log('\n[5] MOLIT 순번 기반 fallback edge 생성 중...');

/**
 * JSON edge canonical key set (O(1) 조회용)
 * 이미 jsonEdgeSet이 있으므로 그대로 활용
 */
const jsonEdgeKeys = jsonEdgeSet; // alias

/**
 * 역명 → [stationId, ...] (lineNum 무관)
 * MOLIT 역명으로 JSON stationMeta 탐색 시 사용
 */
const nameToIds = new Map();
for (const [id, meta] of stationMeta) {
  if (!nameToIds.has(meta.name)) nameToIds.set(meta.name, []);
  nameToIds.get(meta.name).push(id);
}

/**
 * lineNum → molitName (역방향 조회)
 */
const lineNumToMolitName = new Map();
for (const [jsonLineName, cfg] of Object.entries(LINE_CONFIG)) {
  lineNumToMolitName.set(cfg.lineNum, cfg.molitName);
}

let cntEstOrder   = 0;
let cntMolitSkip  = 0;

for (const [molitName, seqMap] of molitSeqMap) {
  const seqToName  = molitSeqToName.get(molitName);
  const maxSeq     = Math.max(...seqMap.values());

  // 이 MOLIT 노선에 대응하는 JSON lineNum 찾기
  let lineNumForMolit = null;
  for (const [lineNum, mName] of lineNumToMolitName) {
    if (mName === molitName) { lineNumForMolit = lineNum; break; }
  }

  for (let seq = 1; seq < maxSeq; seq++) {
    const nameA = seqToName.get(seq);
    const nameB = seqToName.get(seq + 1);
    if (!nameA || !nameB) continue;

    // 두 역이 stationMeta에 존재하는지 (같은 노선 기준 우선, 없으면 스킵)
    let idA = null, idB = null;

    if (lineNumForMolit) {
      const keyA = `${nameA}_${lineNumForMolit}`;
      const keyB = `${nameB}_${lineNumForMolit}`;
      if (stationMeta.has(keyA) && stationMeta.has(keyB)) {
        idA = keyA; idB = keyB;
      }
    }

    // 같은 노선으로 못 찾으면 다른 노선 시도 (MOLIT 역명과 JSON 역명 매칭)
    if (!idA || !idB) {
      const idsA = nameToIds.get(nameA) || [];
      const idsB = nameToIds.get(nameB) || [];
      // 두 역이 동일 노선에 있는 쌍을 우선 선택
      outer:
      for (const a of idsA) {
        for (const b of idsB) {
          if (parseId(a).line === parseId(b).line) {
            idA = a; idB = b; break outer;
          }
        }
      }
    }

    if (!idA || !idB) { cntMolitSkip++; continue; }

    // JSON 위상에 이미 존재하는 edge인지 확인
    const canonKey = [idA, idB].sort().join('|||');
    if (jsonEdgeKeys.has(canonKey)) continue; // 이미 Step4에서 처리됨

    // 아직 없으면 estimated-order edge 추가
    const metaA = stationMeta.get(idA);
    const metaB = stationMeta.get(idB);
    if (!metaA || !metaB) continue;

    const dist = haversine(metaA.lat, metaA.lng, metaB.lat, metaB.lng);
    edges.push({
      fromId: idA, toId: idB,
      travelMin: estimatedMin(dist),
      distKm:    Math.round(dist * 100) / 100,
      isTransfer: false,
      source: 'estimated-order',
    });
    // JSON edge set에 추가 (환승 edge 생성 시 중복 방지는 불필요하지만 통계용)
    jsonEdgeKeys.add(canonKey);
    cntEstOrder++;
  }
}

console.log(`  estimated-order edge: ${cntEstOrder}`);
console.log(`  MOLIT skip (역 미발견): ${cntMolitSkip}`);

// ─── Step 6. 환승 edge 추가 ───────────────────────────────────────────────────

console.log('\n[6] 환승 edge 추가 중...');

const byName = new Map();
for (const [id, meta] of stationMeta) {
  if (!byName.has(meta.name)) byName.set(meta.name, []);
  byName.get(meta.name).push(id);
}

const transferEdges    = [];
const transferStations = [];

for (const [name, ids] of byName) {
  if (ids.length < 2) continue;
  transferStations.push(name);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      transferEdges.push({
        fromId: ids[i], toId: ids[j],
        travelMin: TRANSFER_MIN,
        distKm: 0,
        isTransfer: true,
        source: 'transfer',
      });
    }
  }
}

console.log(`  환승역: ${transferStations.length}개`);
console.log(`  환승 edge: ${transferEdges.length}개`);

// ─── Step 7. 연결성 분석 ──────────────────────────────────────────────────────

console.log('\n[7] 연결성 분석 중...');

const allEdges = [...edges, ...transferEdges];

// 인접 목록 (양방향)
const adjSet = new Map();
for (const [id] of stationMeta) adjSet.set(id, new Set());
for (const e of allEdges) {
  if (!e.isTransfer || true) { // 환승 포함
    adjSet.get(e.fromId)?.add(e.toId);
    adjSet.get(e.toId)?.add(e.fromId);
  }
}

// 고립 노드
const isolated = [...stationMeta.keys()].filter(id => adjSet.get(id).size === 0);

// 노선별 연결 여부
const lineConnected = new Map(); // lineNum → { total, connected }
for (const [id, meta] of stationMeta) {
  const ln = meta.line;
  if (!lineConnected.has(ln)) lineConnected.set(ln, { total: 0, connected: 0 });
  const entry = lineConnected.get(ln);
  entry.total++;
  if (adjSet.get(id).size > 0) entry.connected++;
}

const fullyConnected = [];
const partialLines   = [];

for (const [ln, { total, connected }] of [...lineConnected.entries()].sort((a, b) => a[0] - b[0])) {
  const name = lineNumToName.get(ln) || `line${ln}`;
  if (connected === total) {
    fullyConnected.push(`${name}(${total}역)`);
  } else {
    partialLines.push(`${name}: ${connected}/${total}역 연결`);
  }
}

console.log(`\n  연결된 역:  ${stationMeta.size - isolated.length}`);
console.log(`  고립된 역:  ${isolated.length}`);

if (isolated.length > 0) {
  // 고립 역을 노선별로 분류
  const isolatedByLine = new Map();
  for (const id of isolated) {
    const meta = stationMeta.get(id);
    if (!isolatedByLine.has(meta.lineName)) isolatedByLine.set(meta.lineName, []);
    isolatedByLine.get(meta.lineName).push(meta.name);
  }
  console.log('  고립 역 노선별:');
  for (const [ln, names] of isolatedByLine) {
    console.log(`    ${ln}: ${names.join(', ')}`);
  }
}

// ─── Step 8. nameIndex + 최종 출력 ────────────────────────────────────────────

console.log('\n[8] 결과 파일 생성 중...');

const nameIndex = {};
for (const [name, ids] of byName) {
  nameIndex[name] = ids;
}

const stations = [...stationMeta.entries()].map(([id, meta]) => ({ id, ...meta }));
const output   = { stations, edges: allEdges, nameIndex };

const tsContent = `\
// Auto-generated by scripts/buildSubwayData.mjs — do not edit manually
// Generated: ${new Date().toISOString()}
import type { SubwayGraphData } from '../types/subway';

export const SUBWAY_GRAPH: SubwayGraphData = ${JSON.stringify(output, null, 2)};
`;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, 'subwayGraph.ts');
writeFileSync(outPath, tsContent, 'utf-8');

// ─── 최종 요약 ────────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════');
console.log('  빌드 완료 요약');
console.log('═══════════════════════════════════════════');
console.log(`  전체 등록 역 수:      ${stations.length}`);
console.log(`  csv edge:             ${cntCsv}`);
console.log(`  estimated-json edge:  ${cntEstJson}`);
console.log(`  estimated-order edge: ${cntEstOrder}`);
console.log(`  transfer edge:        ${transferEdges.length}`);
console.log(`  총 edge:              ${allEdges.length}`);
console.log(`  연결된 역:            ${stationMeta.size - isolated.length}`);
console.log(`  고립된 역:            ${isolated.length}`);
console.log('\n  Fully connected 노선:');
for (const s of fullyConnected) console.log(`    ✓ ${s}`);
if (partialLines.length > 0) {
  console.log('\n  미연결 구간 있는 노선:');
  for (const s of partialLines) console.log(`    △ ${s}`);
}
console.log(`\n  출력: ${outPath}`);
