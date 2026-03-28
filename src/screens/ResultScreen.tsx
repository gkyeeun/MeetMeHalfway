import { useEffect } from 'react';
import type { MiddleResult, Category } from '../types';
import { trackEvent } from '../utils/ga4';

interface Props {
  result: MiddleResult;
  onCategorySelect: (category: Category) => void;
  onBack: () => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

export default function ResultScreen({ result, onCategorySelect, onBack }: Props) {
  const { middleStation, travelTimes, origins } = result;

  useEffect(() => {
    trackEvent('middle_result_view', { station: middleStation });
  }, [middleStation]);

  const maxTime = Math.max(...travelTimes);
  const minTime = Math.min(...travelTimes);
  const diff = maxTime - minTime;

  const displayName = (i: number) => result.names?.[i]?.trim() || LABELS[i];

  const fairnessText = origins
    .map((_, i) => `${displayName(i)} ${travelTimes[i]}분`)
    .join(' · ');

  const handleCategory = (category: Category) => {
    trackEvent('category_click', { category });
    onCategorySelect(category);
  };

  const categories: Category[] = ['카페', '맛집', '술집'];

  return (
    <div style={{ padding: '40px 20px 24px' }}>
      <button
        onClick={onBack}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: 0,
          fontSize: 14,
          color: '#888',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        ← 다시 입력
      </button>

      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 6px' }}>가장 공평한 중간 지점</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>
          {middleStation}
        </h1>
      </div>

      <div style={{
        background: '#f7f7f7',
        borderRadius: 12,
        padding: '20px',
        marginBottom: 28,
      }}>
        <p style={{ fontSize: 12, color: '#999', margin: '0 0 14px', fontWeight: 500 }}>
          이동 시간 비교
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {origins.map((origin, i) => (
            <div key={i}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}>
                <span style={{ fontSize: 14, color: '#444' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#111',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    textAlign: 'center',
                    lineHeight: '20px',
                    marginRight: 8,
                  }}>
                    {LABELS[i]}
                  </span>
                  {displayName(i) !== LABELS[i] && (
                    <span style={{ fontWeight: 600, marginRight: 4 }}>{displayName(i)}</span>
                  )}
                  {origin}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
                  {travelTimes[i]}분
                </span>
              </div>
              <div style={{
                height: 4,
                background: '#e8e8e8',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(travelTimes[i] / maxTime) * 100}%`,
                  background: '#111',
                  borderRadius: 2,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{
          fontSize: 13,
          color: '#666',
          marginTop: 16,
          marginBottom: 0,
          lineHeight: 1.5,
        }}>
          {fairnessText}으로{' '}
          {diff <= 5 ? '가장 공평합니다' : `최대 ${diff}분 차이가 납니다`}
        </p>
      </div>

      <div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 12, fontWeight: 500 }}>
          이 주변 장소 보기
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              style={{
                flex: 1,
                padding: '12px 0',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                background: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: '#333',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#111';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = '#111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#333';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
