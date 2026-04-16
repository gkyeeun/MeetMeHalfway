import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import logoSrc from '../logo/logo.png';
import OriginScreen from './screens/OriginScreen';
import ResultScreen from './screens/ResultScreen';
import PlaceScreen from './screens/PlaceScreen';
import { findMiddleStations } from './services/middleFinder';
import type { MiddleResult } from './types';
import { color, button as buttonStyle } from './tokens';
import { trackEvent } from './utils/ga4';

type Screen = 'origin' | 'result' | 'places';

const pageAnim = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit:     { opacity: 0, y: -6, transition: { duration: 0.16, ease: [0.25, 0.1, 0.25, 1] as const } },
};


export default function App() {
  const [preIntro,             setPreIntro]             = useState(true);
  const [intro,               setIntro]               = useState(true);
  const [screen,              setScreen]              = useState<Screen>('origin');
  const [origins,             setOrigins]             = useState<string[]>(['', '']);
  const [names,               setNames]               = useState<string[]>(['', '']);
  const [result,              setResult]              = useState<MiddleResult | null>(null);
  const [selectedStationName,      setSelectedStationName]      = useState<string>('');
  const [selectedStationRank,      setSelectedStationRank]      = useState<number>(1);
  const [hadExplicitSelection,     setHadExplicitSelection]     = useState<boolean>(false);
  const [loading,             setLoading]             = useState(false);

  useEffect(() => {
    if (preIntro) return;
    const t = setTimeout(() => setIntro(false), 1200);
    return () => clearTimeout(t);
  }, [preIntro]);

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
    setSelectedStationRank(1);
    setHadExplicitSelection(false);
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

  const handleStart = () => {
    trackEvent('start_click');
    setPreIntro(false);
    // splash timer kicks off via the useEffect that watches preIntro
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

  const handleExplore = (stationName: string, rank: number, hadExplicit: boolean) => {
    setSelectedStationName(stationName);
    setSelectedStationRank(rank);
    setHadExplicitSelection(hadExplicit);
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
        {preIntro && (
          <motion.div
            key="preIntro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              background: '#FFFFFF',
              overflowY: 'auto',
            }}
          >
            {/* Top nav */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <img src={logoSrc} alt="" style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: -0.3 }}>사잇-길</span>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, padding: '24px clamp(16px, 5vw, 28px) 120px' }}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Badge */}
                <span style={{
                  display: 'inline-block',
                  background: color.accent,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                  marginBottom: 14,
                  letterSpacing: 0.2,
                }}>
                  사용자 테스트 안내
                </span>

                <h1 style={{
                  fontSize: 22, fontWeight: 700, color: '#111',
                  margin: '0 0 24px', lineHeight: 1.3, letterSpacing: -0.5,
                  wordBreak: 'keep-all',
                }}>
                  사잇길 서비스 사용 테스트
                </h1>

                {/* Intro paragraph */}
                <p style={{
                  fontSize: 15, color: '#444', lineHeight: 1.7,
                  margin: '0 0 16px', wordBreak: 'keep-all',
                }}>
                  친구와 만나려 할 때, 서로에게 공평한 중간 지점을 찾기 어렵지 않으셨나요?
                </p>
                <p style={{
                  fontSize: 15, color: '#444', lineHeight: 1.7,
                  margin: '0 0 16px', wordBreak: 'keep-all',
                }}>
                  사잇길은 출발지를 입력하면 지하철 이동시간을 기준으로 서로에게 공평한 중간 만남 장소를 추천해주는 서비스입니다.
                </p>
                <p style={{
                  fontSize: 15, color: '#444', lineHeight: 1.7,
                  margin: '0 0 24px', wordBreak: 'keep-all',
                }}>
                  친구와 약속 장소를 정하는 상황을 떠올리며 서비스를 사용해주세요.
                </p>

                {/* Steps */}
                <div style={{
                  background: color.bgHighlight,
                  borderRadius: 12,
                  padding: '18px 20px',
                  marginBottom: 24,
                }}>
                  {[
                    '출발지를 입력하고',
                    '추천된 결과를 확인한 뒤',
                    '주변 만날 장소를 탐색해주세요',
                  ].map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      marginBottom: i < 2 ? 12 : 0,
                    }}>
                      <span style={{
                        flexShrink: 0,
                        width: 22, height: 22,
                        background: color.accent,
                        color: '#fff',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 14, color: '#333', lineHeight: 1.55, wordBreak: 'keep-all' }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>

                <p style={{
                  fontSize: 14, color: '#888', lineHeight: 1.65,
                  margin: 0, wordBreak: 'keep-all',
                }}>
                  이용을 마친 뒤에는 <strong style={{ color: '#555' }}>[간단 설문 참여하기]</strong> 버튼을 눌러 의견을 남겨주세요.
                </p>
              </motion.div>
            </div>

            {/* Fixed bottom CTA */}
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: '#fff', borderTop: '1px solid #f0f0f0',
            }}>
              <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px clamp(16px, 5vw, 28px)' }}>
                <motion.button
                  onClick={handleStart}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  style={buttonStyle.primaryCta(true)}
                >
                  시작하기
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {!preIntro && intro && (
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
              stationRank={selectedStationRank}
              hadExplicitSelection={hadExplicitSelection}
              result={result}
              onBack={goToResultScreen}
              onReset={resetAppState}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
