import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place, Category } from '../types';
import { getPlacesByStation } from '../data/places';
import { trackEvent } from '../utils/ga4';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  stationName: string;
  onBack: () => void;
}

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['카페', '맛집', '술집'];

const CATEGORY_COLOR: Record<Category, string> = {
  카페:  '#6F4E37',
  맛집:  '#D94F3D',
  술집:  '#4A3C8C',
};

// ─── 지도 마커 ────────────────────────────────────────────────────────────────

function createPlaceIcon(index: number, isSelected: boolean) {
  const size = isSelected ? 32 : 26;
  const bg   = isSelected ? '#111' : '#666';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;background:${bg};border-radius:50%;
      border:2.5px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:${isSelected ? 13 : 11}px;font-weight:700;font-family:sans-serif;
    ">${index + 1}</div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 4)],
  });
}

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = places.filter(p => p.lat && p.lng);
    if (pts.length === 0) return;
    const bounds = L.latLngBounds(pts.map(p => [p.lat!, p.lng!] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [map, places]);
  return null;
}

// ─── 지도 컴포넌트 ────────────────────────────────────────────────────────────

function PlaceMap({
  places, selectedIndex, onMarkerClick,
}: {
  places: Place[];
  selectedIndex: number;
  onMarkerClick: (i: number) => void;
}) {
  const withCoords = places.filter(p => p.lat != null && p.lng != null);
  if (withCoords.length === 0) return null;

  const center: [number, number] = [withCoords[0].lat!, withCoords[0].lng!];

  return (
    <div style={{ height: 'clamp(180px, 45vw, 240px)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
      <MapContainer
        key={places.map(p => p.name).join(',')}
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds places={withCoords} />
        {withCoords.map((p) => {
          const origIdx = places.indexOf(p);
          return (
            <Marker
              key={p.name}
              position={[p.lat!, p.lng!]}
              icon={createPlaceIcon(origIdx, origIdx === selectedIndex)}
              eventHandlers={{ click: () => onMarkerClick(origIdx) }}
            >
              <Popup>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong>{p.name}</strong><br />
                  {p.description && <span style={{ color: '#666' }}>{p.description}</span>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// ─── 별점 ─────────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ fontSize: 12, color: '#f5a623', letterSpacing: -1 }}>
      {'★'.repeat(full)}{half ? '½' : ''}
    </span>
  );
}

// ─── 장소 카드 ────────────────────────────────────────────────────────────────

function PlaceCard({
  place, index, isSelected, accentColor, onClick,
}: {
  place: Place;
  index: number;
  isSelected: boolean;
  accentColor: string;
  onClick: () => void;
}) {
  const handleRoute = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('route_click', { name: place.name });
    if (place.lat && place.lng) {
      const url = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
      window.open(url, '_blank', 'noopener noreferrer');
    }
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: isSelected ? `0 8px 24px ${accentColor}28` : '0 6px 18px rgba(0,0,0,0.09)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        borderRadius: 16,
        border: isSelected ? `1.5px solid ${accentColor}` : '1.5px solid #ebebeb',
        background: '#fff',
        marginBottom: 12,
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: isSelected
          ? `0 4px 16px ${accentColor}22`
          : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {/* 이미지 영역 */}
      <div style={{
        height: 140,
        background: place.imageUrl
          ? `url(${place.imageUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, ${accentColor}22, ${accentColor}0d)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {!place.imageUrl && (
          <span style={{ fontSize: 36, opacity: 0.25 }}>
            {place.category === '카페' ? '☕' : place.category === '맛집' ? '🍽' : '🍺'}
          </span>
        )}
        {/* 번호 배지 */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          width: 24, height: 24,
          background: isSelected ? accentColor : '#00000055',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 11, fontWeight: 700,
          transition: 'background 0.2s',
        }}>
          {index + 1}
        </span>
      </div>

      {/* 정보 영역 */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: -0.2 }}>
              {place.name}
            </p>
            {place.description && (
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#888', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                {place.description}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StarRating rating={place.rating} />
              <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>
                {place.rating.toFixed(1)}
              </span>
              <span style={{ fontSize: 12, color: '#ddd' }}>·</span>
              <span style={{ fontSize: 12, color: '#999' }}>{place.distance}</span>
            </div>
          </div>
          {(place.lat && place.lng) && (
            <motion.button
              onClick={handleRoute}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.12 }}
              style={{
                padding: '9px 14px',
                border: `1px solid ${accentColor}40`,
                borderRadius: 8,
                background: '#fff', cursor: 'pointer',
                fontSize: 13, color: accentColor, fontWeight: 500,
                flexShrink: 0, whiteSpace: 'nowrap',
                minHeight: 40,
              }}
            >
              길찾기
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── PlaceScreen ──────────────────────────────────────────────────────────────

export default function PlaceScreen({ stationName, onBack }: Props) {
  const [category,      setCategory]      = useState<Category>('카페');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const places: Place[] = getPlacesByStation(stationName, category);
  const accentColor = CATEGORY_COLOR[category];

  // 카테고리 변경 시 선택 초기화
  useEffect(() => { setSelectedIndex(0); }, [category]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    trackEvent('category_click', { category: cat });
  };

  const handleCardClick = (i: number) => {
    setSelectedIndex(i);
    trackEvent('place_click', { name: places[i]?.name, category });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* 헤더 */}
      <div style={{ padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 0' }}>
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            padding: 0, fontSize: 14, color: '#888', marginBottom: 22,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← 결과로 돌아가기
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginBottom: 18 }}
        >
          <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 2px', letterSpacing: 0.1 }}>
            {stationName} 주변
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0, letterSpacing: -0.3 }}>
            어디서 만날까요?
          </h1>
        </motion.div>

        {/* 카테고리 탭 */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #ebebeb' }}>
          {CATEGORIES.map((cat) => {
            const active = cat === category;
            const color  = CATEGORY_COLOR[cat];
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  flex: 1, padding: '13px 0',
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: active ? 700 : 400,
                  color: active ? color : '#aaa',
                  borderBottom: active ? `2.5px solid ${color}` : '2.5px solid transparent',
                  marginBottom: -1,
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, padding: '20px clamp(16px, 5vw, 28px) 90px' }}>

        {/* 지도 */}
        <PlaceMap
          places={places}
          selectedIndex={selectedIndex}
          onMarkerClick={handleCardClick}
        />

        {/* 장소 카드 목록 */}
        {places.length === 0 ? (
          <div style={{
            paddingTop: 60, textAlign: 'center',
            color: '#bbb', fontSize: 14,
          }}>
            주변 장소 정보가 없습니다
          </div>
        ) : (
          places.map((place, i) => (
            <motion.div
              key={place.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <PlaceCard
                place={place}
                index={i}
                isSelected={i === selectedIndex}
                accentColor={accentColor}
                onClick={() => handleCardClick(i)}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* 하단 버튼 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #f0f0f0',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px clamp(16px, 5vw, 28px)' }}>
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            style={{
              width: '100%', padding: '15px',
              borderRadius: 12, border: '1px solid #e0e0e0',
              background: '#fff', fontSize: 15, fontWeight: 500,
              color: '#333', cursor: 'pointer',
            }}
          >
            다시 찾기
          </motion.button>
        </div>
      </div>
    </div>
  );
}
