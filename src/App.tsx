import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OriginScreen from './screens/OriginScreen';
import ResultScreen from './screens/ResultScreen';
import PlaceScreen from './screens/PlaceScreen';
import { findMiddleStations } from './services/middleFinder';
import type { MiddleResult } from './types';

type Screen = 'origin' | 'result' | 'places';

const pageAnim = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit:     { opacity: 0, y: -6, transition: { duration: 0.16, ease: [0.25, 0.1, 0.25, 1] as const } },
};

// ─── LoadingScreen ─────────────────────────────────────────────────────────────

const spinnerCss = `
  @keyframes spin { to { transform: rotate(360deg); } }
`;

function LoadingScreen({ message }: { message: string }) {
  return (
    <>
      <style>{spinnerCss}</style>
      <div style={{
        width: 28, height: 28,
        border: '2.5px solid #e8e8e8',
        borderTopColor: '#4F46E5',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: '#aaa', fontWeight: 400, margin: 0, letterSpacing: 0.1 }}>
        {message}
      </p>
    </>
  );
}

export default function App() {
  const [intro,               setIntro]               = useState(true);
  const [screen,              setScreen]              = useState<Screen>('origin');
  const [origins,             setOrigins]             = useState<string[]>(['', '']);
  const [names,               setNames]               = useState<string[]>(['', '']);
  const [result,              setResult]              = useState<MiddleResult | null>(null);
  const [selectedStationName, setSelectedStationName] = useState<string>('');
  const [loading,             setLoading]             = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const resetAppState = () => {
    setOrigins(['', '']);
    setNames(['', '']);
    setResult(null);
    setSelectedStationName('');
    setLoading(false);
    setScreen('origin');
  };

  const handleSubmit = () => {
    const validOrigins = origins.filter((o) => o.trim().length > 0);
    if (validOrigins.length < 2) return;

    setLoading(true);

    // delay lets AnimatePresence finish origin→loading transition before computation
    setTimeout(() => {
      const validNames = names.filter((_, i) => origins[i]?.trim().length > 0);
      const [fromA, fromB] = validOrigins;
      const candidates = findMiddleStations(fromA, fromB);

      if (candidates.length === 0) {
        setLoading(false);
        return;
      }

      setResult({ candidates, origins: validOrigins, names: validNames });
      setLoading(false);
      setScreen('result');
    }, 320);
  };

  const handleExplore = (stationName: string) => {
    setSelectedStationName(stationName);
    setScreen('places');
  };

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '100vh',
      background: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <AnimatePresence mode="wait">
        {intro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: '#fff',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ textAlign: 'center' }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: 1.5, margin: '0 0 12px', textTransform: 'uppercase' }}>
                사잇길
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 10px', letterSpacing: -0.6, lineHeight: 1.2 }}>
                사잇길
              </h1>
              <p style={{ fontSize: 15, color: '#888', margin: 0, fontWeight: 400, letterSpacing: 0.1 }}>
                둘의 사이, 만나기 좋은 길
              </p>
            </motion.div>
          </motion.div>
        )}

        {!intro && loading && (
          <motion.div
            key="loading-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 16, background: '#fff',
            }}
          >
            <LoadingScreen message="사잇길 찾는 중…" />
          </motion.div>
        )}

{!intro && !loading && screen === 'origin' && (
          <motion.div key="origin" {...pageAnim}>
            <div style={{ padding: '16px 20px 0' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: -0.3 }}>
                사잇길
              </span>
            </div>
            <OriginScreen
              origins={origins}
              onOriginsChange={(next) => {
                setOrigins(next);
                setNames((prev) => {
                  const updated = [...prev];
                  while (updated.length < next.length) updated.push('');
                  return updated.slice(0, next.length);
                });
              }}
              names={names}
              onNamesChange={setNames}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </motion.div>
        )}

        {!intro && screen === 'result' && result && (
          <motion.div key="result" {...pageAnim}>
            <ResultScreen
              result={result}
              onExplore={handleExplore}
              onBack={resetAppState}
            />
          </motion.div>
        )}

        {!intro && screen === 'places' && (
          <motion.div key="places" {...pageAnim}>
            <PlaceScreen
              stationName={selectedStationName}
              result={result}
              onBack={resetAppState}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
