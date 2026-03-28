import { useState } from 'react';
import OriginScreen from './screens/OriginScreen';
import ResultScreen from './screens/ResultScreen';
import PlaceScreen from './screens/PlaceScreen';
import { findMiddleStation } from './utils/algorithm';
import type { MiddleResult, Category } from './types';

type Screen = 'origin' | 'result' | 'places';

export default function App() {
  const [screen, setScreen] = useState<Screen>('origin');
  const [origins, setOrigins] = useState<string[]>(['', '']);
  const [names, setNames] = useState<string[]>(['', '']);
  const [result, setResult] = useState<MiddleResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('카페');

  const handleSubmit = () => {
    const validOrigins = origins.filter((o) => o.trim().length > 0);
    if (validOrigins.length < 2) return;
    const validNames = names.filter((_, i) => origins[i]?.trim().length > 0);
    const r = { ...findMiddleStation(validOrigins), names: validNames };
    setResult(r);
    setScreen('result');
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setScreen('places');
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: '0 auto',
      minHeight: '100vh',
      background: '#fff',
      position: 'relative',
    }}>
      {screen === 'origin' && (
        <div style={{ padding: '16px 20px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: -0.3 }}>
            사잇길
          </span>
        </div>
      )}

      {screen === 'origin' && (
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
        />
      )}

      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          onCategorySelect={handleCategorySelect}
          onBack={() => setScreen('origin')}
        />
      )}

      {screen === 'places' && result && (
        <PlaceScreen
          result={result}
          initialCategory={selectedCategory}
          onBack={() => setScreen('result')}
        />
      )}
    </div>
  );
}
