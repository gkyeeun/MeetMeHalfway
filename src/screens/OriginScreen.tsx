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
    if (origins.length < 4) {
      onOriginsChange([...origins, '']);
    }
  };

  const removeOrigin = (index: number) => {
    const next = origins.filter((_, i) => i !== index);
    onOriginsChange(next);
  };

  const canSubmit = !loading && origins.filter((o) => o.trim().length > 0).length >= 2;

  const handleSubmit = () => {
    trackEvent('origin_input_complete', { count: origins.filter((o) => o).length });
    trackEvent('calculate_middle_click');
    onSubmit();
  };

  return (
    <div style={{ padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 24px' }}>
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
          2~4명의 출발역을 입력하세요
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {origins.map((origin, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                value={names[i] ?? ''}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`이름 (예: ${['김우디', '이사잇', '박길', '최중'][i]})`}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e0e0e0',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fafafa',
                }}
              />
              <StationInput
                value={origin}
                onChange={(val) => updateOrigin(i, val)}
                index={i}
              />
            </div>
            {origins.length > 2 && (
              <button
                onClick={() => removeOrigin(i)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#bbb',
                  fontSize: 18,
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                −
              </button>
            )}
          </div>
        ))}
      </motion.div>

      {origins.length < 4 && (
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

      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
        transition={{ duration: 0.12 }}
        style={{
          marginTop: 32,
          width: '100%',
          padding: '18px 16px',
          borderRadius: 10,
          border: 'none',
          background: canSubmit ? '#111' : '#e0e0e0',
          color: canSubmit ? '#fff' : '#aaa',
          fontSize: 16,
          fontWeight: 600,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'background 0.15s',
        }}
      >
        {loading ? '추천 계산 중...' : '중간 지점 찾기'}
      </motion.button>
    </div>
  );
}
