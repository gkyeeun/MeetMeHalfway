import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import logoSrc from '../logo/logo.png';
import OriginScreen from './screens/OriginScreen';
import ResultScreen from './screens/ResultScreen';
import PlaceScreen from './screens/PlaceScreen';
import { findMiddleStations } from './services/middleFinder';
import type { MiddleResult } from './types';
import DebugOverlay from './components/DebugOverlay';

type Screen = 'origin' | 'result' | 'places';

const pageAnim = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit:     { opacity: 0, y: -6, transition: { duration: 0.16, ease: [0.25, 0.1, 0.25, 1] as const } },
};


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

  useEffect(() => {
    const gtag = (window as unknown as { gtag?: Function }).gtag;
    if (!gtag) return;
    gtag('config', 'G-R77MWE8VM7');
  }, []);

  const resetAppState = () => {
    setOrigins(['', '']);
    setNames(['', '']);
    setResult(null);
    setSelectedStationName('');
    setLoading(false);
    setScreen('origin');
  };

  const goToResultScreen = () => {
    setScreen('result');
  };

  const goToIntro = () => {
    setOrigins(['', '']);
    setNames(['', '']);
    setResult(null);
    setSelectedStationName('');
    setLoading(false);
    setScreen('origin');
    setIntro(true);
    setTimeout(() => setIntro(false), 1200);
  };

  const handleSubmit = () => {
    const validOrigins = origins.filter((o) => o.trim().length > 0);
    if (validOrigins.length < 2) return;

    setLoading(true);

    // delay lets AnimatePresence finish origin→loading transition before computation
    setTimeout(() => {
      const validNames = names.filter((_, i) => origins[i]?.trim().length > 0);
      const candidates = findMiddleStations(validOrigins);

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
      background: '#FFFFFF',
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
              background: '#F9F9F9',
            }}
          >
            {/* Top nav */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={logoSrc} alt="" style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: -0.3 }}>사잇-길</span>
            </div>

            {/* Content — left-aligned, vertically centered */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(16px, 5vw, 28px) 80px' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Logo box */}
                <div style={{
                  width: 56, height: 56,
                  background: '#fff',
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <img src={logoSrc} alt="사잇-길" style={{ width: 28, height: 28 }} />
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: -0.5, lineHeight: 1.2 }}>
                  사잇-길
                </h1>
                <p style={{ fontSize: 15, color: '#888', margin: 0, fontWeight: 400 }}>
                  우리 사이, 만나기 좋은 길
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {!intro && screen === 'origin' && (
          <motion.div key="origin" {...pageAnim}>
            <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={logoSrc} alt="" style={{ width: 14, height: 14, cursor: 'pointer' }} onClick={goToIntro} />
              <span
                onClick={goToIntro}
                style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: -0.3, cursor: 'pointer' }}
              >
                사잇-길
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
              onBack={goToResultScreen}
              onReset={resetAppState}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <DebugOverlay />
    </div>
  );
}
