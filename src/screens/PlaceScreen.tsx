import { useState } from 'react';
import type { MiddleResult, Category, Place } from '../types';
import { getPlacesByStation } from '../data/places';
import { trackEvent } from '../utils/ga4';

interface Props {
  result: MiddleResult;
  initialCategory: Category;
  onBack: () => void;
}

const CATEGORIES: Category[] = ['카페', '맛집', '술집'];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ fontSize: 12, color: '#f5a623', letterSpacing: -1 }}>
      {'★'.repeat(full)}{half ? '½' : ''}
    </span>
  );
}

export default function PlaceScreen({ result, initialCategory, onBack }: Props) {
  const [category, setCategory] = useState<Category>(initialCategory);
  const places: Place[] = getPlacesByStation(result.middleStation, category);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    trackEvent('category_click', { category: cat });
  };

  const handlePlaceClick = (place: Place) => {
    trackEvent('place_click', { name: place.name, category: place.category });
  };

  const handleRouteClick = (place: Place, e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('route_click', { name: place.name });
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
    window.open(url, '_blank', 'noopener noreferrer');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '40px 20px 0' }}>
        <button
          onClick={onBack}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
            fontSize: 14,
            color: '#888',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← 결과로 돌아가기
        </button>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 4px' }}>
            {result.middleStation} 주변
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>
            {category} 추천
          </h1>
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #e8e8e8',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: category === cat ? 600 : 400,
                color: category === cat ? '#111' : '#999',
                borderBottom: category === cat ? '2px solid #111' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Place list */}
      <div style={{ flex: 1, padding: '0 20px 80px' }}>
        {places.length === 0 ? (
          <div style={{
            paddingTop: 60,
            textAlign: 'center',
            color: '#aaa',
            fontSize: 14,
          }}>
            주변 장소 정보가 없습니다
          </div>
        ) : (
          places.map((place, i) => (
            <div
              key={i}
              onClick={() => handlePlaceClick(place)}
              style={{
                padding: '18px 0',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>
                    {place.name}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <StarRating rating={place.rating} />
                  <span style={{ fontSize: 12, color: '#888' }}>{place.rating.toFixed(1)}</span>
                  <span style={{ fontSize: 12, color: '#ccc' }}>·</span>
                  <span style={{ fontSize: 12, color: '#888' }}>{place.distance}</span>
                </div>
              </div>
              <button
                onClick={(e) => handleRouteClick(place, e)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid #e0e0e0',
                  borderRadius: 6,
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#333',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                길찾기
              </button>
            </div>
          ))
        )}
      </div>

      {/* Recalculate button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
      }}>
        <button
          onClick={() => {
            trackEvent('recalculate_click');
            onBack();
          }}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 10,
            border: '1px solid #e0e0e0',
            background: '#fff',
            fontSize: 15,
            fontWeight: 500,
            color: '#333',
            cursor: 'pointer',
          }}
        >
          다시 찾기
        </button>
      </div>
    </div>
  );
}
