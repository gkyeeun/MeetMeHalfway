import { useState } from 'react';
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

export default function App() {
  const [screen,              setScreen]              = useState<Screen>('origin');
  const [origins,             setOrigins]             = useState<string[]>(['', '']);
  const [names,               setNames]               = useState<string[]>(['', '']);
  const [result,              setResult]              = useState<MiddleResult | null>(null);
  const [selectedStationName, setSelectedStationName] = useState<string>('');
  const [loading,             setLoading]             = useState(false);

  const handleSubmit = () => {
    const validOrigins = origins.filter((o) => o.trim().length > 0);
    if (validOrigins.length < 2) return;

    setLoading(true);

    // setTimeout(0) renders loading state before synchronous computation
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
    }, 0);
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
        {screen === 'origin' && (
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

        {screen === 'result' && result && (
          <motion.div key="result" {...pageAnim}>
            <ResultScreen
              result={result}
              onExplore={handleExplore}
              onBack={() => setScreen('origin')}
            />
          </motion.div>
        )}

        {screen === 'places' && (
          <motion.div key="places" {...pageAnim}>
            <PlaceScreen
              stationName={selectedStationName}
              onBack={() => setScreen('result')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
