import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { MiddleResult } from '../types';
import type { CandidateStation } from '../types/subway';
import { getLineColor } from '../utils/lineColors';
import { SUBWAY_GRAPH } from '../data/subwayGraph';
import { trackEvent, trackPageView } from '../utils/ga4';
import { color, button as buttonStyle } from '../tokens';

interface Props {
  result: MiddleResult;
  onExplore: (stationName: string) => void;
  onBack: () => void;
}

// ─── 사잇길 점수 (낮은 raw score → 높은 표시 점수) ──────────────────────────────

function toDisplayScore(rawScore: number, all: CandidateStation[]): number {
  const min = Math.min(...all.map((c) => c.score));
  const max = Math.max(...all.map((c) => c.score));
  if (max === min) return 100;
  return Math.max(60, Math.round(100 - ((rawScore - min) / (max - min)) * 100));
}

// ─── 카드 설명 ─────────────────────────────────────────────────────────────────

function makeDescription(c: CandidateStation, all: CandidateStation[]): string {
  const minSpread = Math.min(...all.map(x => x.spread));
  const minAvg    = Math.min(...all.map(x => x.avgDuration));

  if (c.spread === minSpread && c.spread <= 5) return '모든 분의 이동시간이 가장 균형 잡혀 있어요';
  if (c.avgDuration === minAvg)                return '전체 이동시간이 가장 짧은 후보예요';
  return '누군가 조금 더 빠르게 도착할 수 있는 대안이에요';
}

// ─── 경로 한 줄 표시 ───────────────────────────────────────────────────────────

function RouteRow({
  label, route, duration, arrivalLine, arrivalColor,
}: {
  label: string;
  route: string[];
  duration: number;
  arrivalLine: string;
  arrivalColor: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 6,
      marginBottom: 5, flexWrap: 'wrap',
    }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: '#666',
        minWidth: 36, flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', flex: 1 }}>
        {route.map((stn, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ fontSize: 10, color: '#ccc' }}>→</span>}
            <span style={{
              fontSize: 12,
              color: i === route.length - 1 ? '#111' : (i === 0 ? '#444' : '#888'),
              fontWeight: i === route.length - 1 ? 600 : 400,
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
            }}>
              {stn}
            </span>
          </React.Fragment>
        ))}
        <span style={{
          fontSize: 10, color: arrivalColor,
          background: `${arrivalColor}18`,
          borderRadius: 6, padding: '1px 5px',
          fontWeight: 600, flexShrink: 0,
        }}>
          {arrivalLine}
        </span>
      </div>
      <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>
        {duration}분
      </span>
    </div>
  );
}

// ─── 후보 카드 ────────────────────────────────────────────────────────────────

function CandidateCard({
  candidate, origins, names,
  isSelected, description, displayScore,
  onSelect,
}: {
  candidate: CandidateStation;
  origins: string[];
  names?: string[];
  isSelected: boolean;
  description: string;
  displayScore: number;
  onSelect: () => void;
}) {
  const lineColor      = getLineColor(candidate.line);
  const isTop          = candidate.rank === 1;
  const isTransfer     = (SUBWAY_GRAPH.nameIndex[candidate.stationName] ?? []).length > 1;
  const displayName    = (i: number) => names?.[i]?.trim() || origins[i] || `출발지 ${i + 1}`;

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -2, boxShadow: isSelected ? `0 8px 28px ${lineColor}35` : '0 6px 20px rgba(0,0,0,0.09)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        borderRadius: 14,
        border: isSelected ? `1.5px solid ${lineColor}` : isTop ? `1.5px solid ${lineColor}60` : `1px solid ${color.border}`,
        background: '#fff',
        marginBottom: 12,
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: isSelected
          ? `0 4px 20px ${lineColor}28`
          : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {/* 상단 컬러 바 */}
      <div style={{
        height: 4,
        background: isSelected ? lineColor : isTop ? `${lineColor}50` : '#f0f0f0',
        transition: 'background 0.2s',
      }} />

      <div style={{ padding: '16px 16px 18px' }}>
        {isTop && (
          <div style={{ marginBottom: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: lineColor,
              background: `${lineColor}14`,
              borderRadius: 6, padding: '2px 7px',
              letterSpacing: 0.4,
            }}>
              추천
            </span>
          </div>
        )}
        {/* 순위 + 역명 + 라인 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%',
            background: isSelected ? lineColor : '#e0e0e0',
            color: isSelected ? '#fff' : '#888',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
            transition: 'background 0.2s, color 0.2s',
          }}>
            {candidate.rank}
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: -0.4 }}>
            {candidate.stationName}
          </span>
          <span style={{
            fontSize: 11, color: '#fff',
            background: lineColor,
            borderRadius: 6, padding: '2px 7px', fontWeight: 600,
          }}>
            {candidate.lineName}
          </span>
          {isTransfer && (
            <span style={{
              fontSize: 10, color: '#888',
              background: '#f0f0f0',
              borderRadius: 6, padding: '2px 6px', fontWeight: 500,
            }}>
              환승역
            </span>
          )}
        </div>

        {/* 이동시간 + 점수 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '2px 0',
              marginBottom: 4,
            }}>
              {candidate.durationsByOrigin.map((d, i) => (
                <span key={i} style={{ fontSize: 13, fontWeight: 600, color: '#111', letterSpacing: -0.2, whiteSpace: 'nowrap', marginRight: 8 }}>
                  {displayName(i)} {d}분
                </span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>
              평균 {candidate.avgDuration}분 · 편차 {candidate.spread.toFixed(1)}분
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#aaa', marginBottom: 1 }}>사잇길 점수</div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: -0.5 }}>
                {displayScore}
              </span>
              <span style={{ fontSize: 11, color: '#aaa', marginLeft: 2 }}>점</span>
            </div>
          </div>
        </div>

        {/* 설명 문구 */}
        <p style={{
          margin: 0, fontSize: 11,
          color: isSelected ? '#888' : '#ccc',
          lineHeight: 1.6,
          transition: 'color 0.2s',
        }}>
          {description}
          {isTransfer && (
            <span style={{ color: '#aaa', marginLeft: 6, fontSize: 11 }}>
              · 다중 노선 이용 가능
            </span>
          )}
        </p>

        {/* 선택 시: 경로 + 탐색 버튼 */}
        {isSelected && (
          <>
            {/* 경로 안내 */}
            {candidate.routesByOrigin.some(r => r.length > 0) && (
              <div style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid #f0f0f0',
              }}>
                <p style={{
                  margin: '0 0 10px',
                  fontSize: 10, fontWeight: 700, color: '#aaa',
                  textTransform: 'uppercase', letterSpacing: 0.8,
                }}>
                  예상 경로
                </p>
                {candidate.routesByOrigin.map((route, i) =>
                  route.length > 0 && (
                    <RouteRow
                      key={i}
                      label={displayName(i)}
                      route={route}
                      duration={candidate.durationsByOrigin[i] ?? 0}
                      arrivalLine={candidate.lineName}
                      arrivalColor={lineColor}
                    />
                  )
                )}
              </div>
            )}

          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── ResultScreen ─────────────────────────────────────────────────────────────

export default function ResultScreen({ result, onExplore, onBack }: Props) {
  const { candidates, origins, names } = result;
  const [selectedId, setSelectedId] = useState(candidates[0]?.stationId ?? '');

  useEffect(() => {
    trackPageView('Result', '/result');
    trackEvent('result_view', { candidate_count: candidates.length });
  }, []);

  const selectedCandidate = candidates.find((c) => c.stationId === selectedId);

  const handleExplore = () => {
    if (!selectedCandidate) return;
    trackEvent('explore_click', { station: selectedCandidate.stationName, rank: selectedCandidate.rank });
    onExplore(selectedCandidate.stationName);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 0', flex: 1 }}>
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          style={buttonStyle.ghost}
        >
          ← 다시 입력
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginBottom: 28 }}
        >
          <span style={{
            display: 'inline-block',
            background: color.accent,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            marginBottom: 10,
            letterSpacing: 0.2,
          }}>
            result!
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.2, letterSpacing: -0.5 }}>
            중간 지점 추천
          </h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 6, marginBottom: 0 }}>
            {origins.join(' · ')} 기준
          </p>
        </motion.div>

        <div style={{ paddingBottom: 100 }}>
          {candidates.map((c, index) => (
            <motion.div
              key={c.stationId}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <CandidateCard
                candidate={c}
                origins={origins}
                names={names}
                isSelected={c.stationId === selectedId}
                description={makeDescription(c, candidates)}
                displayScore={toDisplayScore(c.score, candidates)}
                onSelect={() => {
                  setSelectedId(c.stationId);
                  console.log('Firing event: result_select', { rank: c.rank, station: c.stationName });
                  trackEvent('result_select', { rank: c.rank, station: c.stationName });
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 하단 fixed CTA */}
      {selectedCandidate && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #f0f0f0',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px clamp(16px, 5vw, 28px)' }}>
            <motion.button
              onClick={handleExplore}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={buttonStyle.forwardCta}
            >
              <span>근처 장소 탐색하기</span>
              <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
