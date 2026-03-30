import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { MiddleResult } from '../types';
import type { CandidateStation } from '../types/subway';
import { getLineColor } from '../utils/lineColors';
import { SUBWAY_GRAPH } from '../data/subwayGraph';
import { trackEvent } from '../utils/ga4';

interface Props {
  result: MiddleResult;
  onExplore: (stationName: string) => void;
  onBack: () => void;
}

// ─── 카드 설명 ─────────────────────────────────────────────────────────────────

function makeDescription(c: CandidateStation, all: CandidateStation[]): string {
  const diff    = Math.abs(c.durationFromA - c.durationFromB);
  const minDiff = Math.min(...all.map(x => Math.abs(x.durationFromA - x.durationFromB)));
  const minAvg  = Math.min(...all.map(x => x.avgDuration));

  if (diff === minDiff && diff <= 5) return '두 분의 이동시간이 가장 균형 잡혀 있어요';
  if (c.avgDuration === minAvg)      return '전체 이동시간이 가장 짧은 후보예요';
  return '한 분이 조금 더 빠르게 도착할 수 있는 대안이에요';
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
          borderRadius: 4, padding: '1px 5px',
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
  isSelected, description,
  onSelect, onExplore,
}: {
  candidate: CandidateStation;
  origins: string[];
  names?: string[];
  isSelected: boolean;
  description: string;
  onSelect: () => void;
  onExplore: () => void;
}) {
  const [ctaHovered, setCtaHovered] = useState(false);
  const lineColor      = getLineColor(candidate.line);
  const isTransfer     = (SUBWAY_GRAPH.nameIndex[candidate.stationName] ?? []).length > 1;
  const displayName    = (i: number) => names?.[i]?.trim() || origins[i] || `출발지 ${i + 1}`;

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -2, boxShadow: isSelected ? `0 8px 28px ${lineColor}35` : '0 6px 20px rgba(0,0,0,0.09)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        borderRadius: 16,
        border: isSelected ? `1.5px solid ${lineColor}` : '1.5px solid #ebebeb',
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
        background: isSelected ? lineColor : '#f0f0f0',
        transition: 'background 0.2s',
      }} />

      <div style={{ padding: '16px 16px 18px' }}>
        {/* 순위 + 역명 + 라인 배지 + 평균 시간 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              borderRadius: 5, padding: '2px 7px', fontWeight: 600,
            }}>
              {candidate.lineName}
            </span>
            {isTransfer && (
              <span style={{
                fontSize: 10, color: '#888',
                background: '#f0f0f0',
                borderRadius: 4, padding: '2px 6px', fontWeight: 500,
              }}>
                환승역
              </span>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: -0.5 }}>
              {candidate.avgDuration}
            </span>
            <span style={{ fontSize: 12, color: '#aaa', marginLeft: 2 }}>분</span>
          </div>
        </div>

        {/* 출발지별 소요시간 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {[0, 1].map((i) => (
            <span key={i} style={{
              fontSize: 12, color: '#666',
              background: '#f6f6f6', borderRadius: 6, padding: '4px 10px',
            }}>
              {displayName(i)} → {i === 0 ? candidate.durationFromA : candidate.durationFromB}분
            </span>
          ))}
        </div>

        {/* 설명 문구 */}
        <p style={{
          margin: 0, fontSize: 12,
          color: isSelected ? '#555' : '#bbb',
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
            {(candidate.routeFromA || candidate.routeFromB) && (
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
                {candidate.routeFromA && candidate.routeFromA.length > 0 && (
                  <RouteRow
                    label={displayName(0)}
                    route={candidate.routeFromA}
                    duration={candidate.durationFromA}
                    arrivalLine={candidate.lineName}
                    arrivalColor={lineColor}
                  />
                )}
                {candidate.routeFromB && candidate.routeFromB.length > 0 && (
                  <RouteRow
                    label={displayName(1)}
                    route={candidate.routeFromB}
                    duration={candidate.durationFromB}
                    arrivalLine={candidate.lineName}
                    arrivalColor={lineColor}
                  />
                )}
              </div>
            )}

            {/* 근처 장소 탐색 */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ marginTop: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={onExplore}
                onHoverStart={() => setCtaHovered(true)}
                onHoverEnd={() => setCtaHovered(false)}
                whileTap={{ scale: 0.98 }}
                animate={{
                  background: ctaHovered ? lineColor : `${lineColor}0d`,
                  color: ctaHovered ? '#fff' : lineColor,
                  borderColor: ctaHovered ? lineColor : `${lineColor}55`,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  width: '100%', padding: '13px 16px',
                  border: `1px solid ${lineColor}55`,
                  borderRadius: 10,
                  background: `${lineColor}0d`,
                  cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                  color: lineColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span>근처 장소 탐색하기</span>
                <motion.span
                  animate={{ x: ctaHovered ? 4 : 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ fontSize: 15, lineHeight: 1 }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
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

  return (
    <div style={{ padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 48px' }}>
      <motion.button
        onClick={onBack}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        style={{
          border: 'none', background: 'none', cursor: 'pointer',
          padding: 0, fontSize: 14, color: '#888', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        ← 다시 입력
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ marginBottom: 28 }}
      >
        <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 4px', letterSpacing: 0.1 }}>
          {origins.join(' · ')} 기준
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: -0.4 }}>
          중간 지점 추천
        </h1>
      </motion.div>

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
            onSelect={() => setSelectedId(c.stationId)}
            onExplore={() => { trackEvent('explore_click', { station: c.stationName }); onExplore(c.stationName); }}
          />
        </motion.div>
      ))}
    </div>
  );
}
