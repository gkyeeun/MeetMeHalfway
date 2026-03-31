import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import StationInput from '../components/StationInput';
import { trackEvent } from '../utils/ga4';

interface Props {
  origins: string[];
  onOriginsChange: (origins: string[]) => void;
  names: string[];
  onNamesChange: (names: string[]) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function OriginScreen({ origins, onOriginsChange, names, onNamesChange, onSubmit, loading = false }: Props) {
  const [focusedNameIdx,   setFocusedNameIdx]   = useState<number | null>(null);
  const [confirmedOrigins, setConfirmedOrigins] = useState<boolean[]>(() => origins.map(() => false));

  const updateOrigin = (index: number, value: string) => {
    const next = [...origins];
    next[index] = value;
    onOriginsChange(next);
  };

  const updateName = (index: number, value: string) => {
    const next = [...names];
    next[index] = value;
    onNamesChange(next);
  };

  const addOrigin = () => {
    if (origins.length < 5) {
      onOriginsChange([...origins, '']);
      setConfirmedOrigins(prev => [...prev, false]);
    }
  };

  const removeOrigin = (index: number) => {
    const next = origins.filter((_, i) => i !== index);
    onOriginsChange(next);
    setConfirmedOrigins(prev => prev.filter((_, i) => i !== index));
  };

  const confirmOrigin = (index: number) => {
    setConfirmedOrigins(prev => { const c = [...prev]; c[index] = true; return c; });
  };

  const resetOrigin = (index: number) => {
    setConfirmedOrigins(prev => { const c = [...prev]; c[index] = false; return c; });
  };

  const canSubmit = !loading && origins.filter((o) => o.trim().length > 0).length >= 2;

  const handleSubmit = () => {
    trackEvent('origin_input_complete', { count: origins.filter((o) => o).length });
    trackEvent('calculate_middle_click');
    onSubmit();
  };

  return (
    <div style={{ padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 96px' }}>
      <style>{`@keyframes os-spin { to { transform: rotate(360deg); } }`}</style>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#111',
          margin: 0,
          lineHeight: 1.3,
        }}>
          어디서 출발하시나요
        </h1>
        <p style={{ fontSize: 14, color: '#888', marginTop: 8, marginBottom: 0 }}>
          2~5명의 출발역을 입력하세요
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {origins.map((origin, i) => {
          const isDone = !!(names[i]?.trim()) && !!(origin.trim()) && !!confirmedOrigins[i];
          return (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e8e8e8',
            padding: '16px',
          }}>
            {/* 카드 헤더: 번호 + 삭제 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: 0.2 }}>
                {i + 1}번 출발지
              </span>
              {origins.length > 2 && (
                <button
                  onClick={() => removeOrigin(i)}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: '#bbb', fontSize: 18, padding: '0 2px',
                    display: 'flex', alignItems: 'center', lineHeight: 1,
                  }}
                >
                  −
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                value={names[i] ?? ''}
                onChange={(e) => updateName(i, e.target.value)}
                onFocus={() => setFocusedNameIdx(i)}
                onBlur={() => setFocusedNameIdx(null)}
                placeholder={`이름 (예: ${['김우디', '이사잇', '박길', '최중', '오다섯'][i]})`}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${focusedNameIdx === i ? '#000' : '#e0e0e0'}`,
                  boxShadow: 'none',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fafafa',
                  transition: 'border-color 0.18s',
                }}
              />
              <StationInput
                value={origin}
                onChange={(val) => updateOrigin(i, val)}
                onConfirm={() => confirmOrigin(i)}
                onReset={() => resetOrigin(i)}
                index={i}
              />
              {isDone && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0 0 2px' }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="6" fill="#22C55E" fillOpacity="0.12" />
                    <path d="M4 6.5L5.8 8.5L9 5" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 500 }}>입력 완료</span>
                </motion.div>
              )}
            </div>
          </div>
          );
        })}
      </motion.div>

      {origins.length < 5 && (
        <motion.button
          onClick={addOrigin}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.12 }}
          style={{
            marginTop: 12,
            width: '100%',
            padding: '12px',
            border: '1px dashed #d0d0d0',
            borderRadius: 8,
            background: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>+</span>
          출발지 추가
        </motion.button>
      )}

      {createPortal(
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #f0f0f0',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px' }}>
            <motion.button
              onClick={handleSubmit}
              disabled={!canSubmit}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              transition={{ duration: 0.12 }}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 16,
                border: 'none',
                background: canSubmit ? '#111' : '#e0e0e0',
                color: canSubmit ? '#fff' : '#aaa',
                fontSize: 16,
                fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, flexShrink: 0,
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'os-spin 0.75s linear infinite',
                  }} />
                  사잇길 찾는 중…
                </span>
              ) : '중간 지점 찾기'}
            </motion.button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
