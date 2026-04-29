import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Place, Category, MiddleResult } from '../types';
import { searchPlacesByStation } from '../services/kakaoLocal';
import { getPlacesByStation } from '../data/places';
import { trackEvent, trackPageView } from '../utils/ga4';
import KakaoMap from '../components/KakaoMap';
import { buildGraph } from '../services/graphBuilder';
import { SUBWAY_GRAPH } from '../data/subwayGraph';
import { color, button as buttonStyle } from '../tokens';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  stationName: string;
  stationRank: number;
  hadExplicitSelection: boolean;
  result: MiddleResult | null;
  onBack: () => void;
  onReset: () => void;
}

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['카페', '맛집', '술집'];


type SortKey = 'recommend' | 'distance';

const spinnerCss = `@keyframes ps-spin { to { transform: rotate(360deg); } }`;

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function parseDistance(d?: string): number {
  if (!d) return Infinity;
  const n = parseFloat(d.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return Infinity;
  if (d.includes('분')) return n * 80;
  return n;
}

function haversineM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6_371_000;
  const dLat = (bLat - aLat) * (Math.PI / 180);
  const dLng = (bLng - aLng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * (Math.PI / 180)) * Math.cos(bLat * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface OriginCoords { lat: number; lng: number }

function sortPlaces(list: Place[], key: SortKey, origins?: [OriginCoords, OriginCoords]): Place[] {
  if (key === 'distance') {
    return [...list].sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
  }
  // 추천순: |distA − distB| 오름차순 (두 사용자 이동거리 균형)
  if (origins && list.some((p) => p.lat != null && p.lng != null)) {
    const [oA, oB] = origins;
    return [...list].sort((a, b) => {
      const balA = a.lat != null && a.lng != null
        ? Math.abs(haversineM(oA.lat, oA.lng, a.lat!, a.lng!) - haversineM(oB.lat, oB.lng, a.lat!, a.lng!))
        : Infinity;
      const balB = b.lat != null && b.lng != null
        ? Math.abs(haversineM(oA.lat, oA.lng, b.lat!, b.lng!) - haversineM(oB.lat, oB.lng, b.lat!, b.lng!))
        : Infinity;
      return balA - balB;
    });
  }
  // fallback: rating 내림차순
  return [...list].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
}

const graph = buildGraph(SUBWAY_GRAPH);

function getOriginCoords(result: MiddleResult | null): [OriginCoords, OriginCoords] | undefined {
  if (!result?.origins || result.origins.length < 2) return undefined;
  const [nameA, nameB] = result.origins;
  const nodeA = graph.findByName(nameA)[0];
  const nodeB = graph.findByName(nameB)[0];
  if (!nodeA || !nodeB) return undefined;
  return [{ lat: nodeA.lat, lng: nodeA.lng }, { lat: nodeB.lat, lng: nodeB.lng }];
}

// ─── 장소 카드 ────────────────────────────────────────────────────────────────

function PlaceCard({
  place, index, isSelected, accentColor, usedAutoSelected, onClick,
}: {
  place: Place;
  index: number;
  isSelected: boolean;
  accentColor: string;
  usedAutoSelected: boolean;
  onClick: () => void;
}) {
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const handleRoute = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Firing event: route_click', { name: place.name, used_auto_selected: usedAutoSelected ? "true" : "false" });
    trackEvent('route_click', { name: place.name, used_auto_selected: usedAutoSelected ? "true" : "false" });
    if (place.lat && place.lng) {
      const url = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
      window.open(url, '_blank', 'noopener noreferrer');
    }
  };

  const handleKakaoMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Firing event: map_click', { name: place.name, used_auto_selected: usedAutoSelected ? "true" : "false" });
    trackEvent('map_click', { name: place.name, used_auto_selected: usedAutoSelected ? "true" : "false" });
    if (place.placeUrl) {
      window.open(place.placeUrl, '_blank', 'noopener noreferrer');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = place.placeUrl
      ?? (place.lat && place.lng
        ? `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`
        : window.location.href);
    const shareData = {
      title: '사잇길 장소 공유',
      text: `${place.name} 어때요?${place.address ? ` ${place.address}` : ''}`,
      url: shareUrl,
    };
    const shareMethod = ('share' in navigator) && navigator.canShare(shareData) ? 'native' : 'clipboard';
    console.log('Firing event: share_click', { name: place.name, share_method: shareMethod, used_auto_selected: usedAutoSelected ? "true" : "false" });
    trackEvent('share_click', { name: place.name, share_method: shareMethod, used_auto_selected: usedAutoSelected ? "true" : "false" });
    if (shareMethod === 'native') {
      await navigator.share(shareData).catch(() => null);
    } else {
      await navigator.clipboard.writeText(shareUrl).catch(() => null);
      setCopyMsg('링크가 복사되었어요');
      setTimeout(() => setCopyMsg(null), 2000);
    }
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -1, boxShadow: isSelected ? `0 6px 20px ${accentColor}28` : '0 4px 14px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        borderRadius: 10,
        border: isSelected ? `1.5px solid ${accentColor}` : `1px solid ${color.border}`,
        background: '#fff',
        marginBottom: 8,
        cursor: 'pointer',
        boxShadow: isSelected ? `0 2px 12px ${accentColor}18` : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'background 0.2s, box-shadow 0.2s, border-color 0.2s',
      }}
    >
      <div style={{ padding: '12px 14px' }}>
        {/* 상단: 번호 + 장소명 + 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {/* 번호 배지 */}
          <span style={{
            width: 22, height: 22, flexShrink: 0,
            background: isSelected ? accentColor : '#d0d0d0',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700,
            transition: 'background 0.2s',
          }}>
            {index + 1}
          </span>

          {/* 장소명 */}
          <p style={{
            flex: 1, margin: 0,
            fontSize: 14, fontWeight: 700, color: '#111',
            letterSpacing: -0.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {place.name}
          </p>

          {/* 버튼 그룹 */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
            {copyMsg && (
              <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>
                {copyMsg}
              </span>
            )}
            {place.placeUrl && (
              <motion.button
                onClick={handleKakaoMap}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                style={{
                  padding: '5px 10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: 6,
                  background: '#fff', cursor: 'pointer',
                  fontSize: 11, color: '#666', fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                지도보기
              </motion.button>
            )}
            {(place.lat && place.lng) && (
              <motion.button
                onClick={handleRoute}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                style={{
                  padding: '5px 10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: 6,
                  background: '#fff', cursor: 'pointer',
                  fontSize: 11, color: '#666', fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                길찾기
              </motion.button>
            )}
            <motion.button
              onClick={handleShare}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{
                padding: '5px 10px',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                background: '#fff', cursor: 'pointer',
                fontSize: 11, color: '#666', fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              공유
            </motion.button>
          </div>
        </div>

        {/* 하단: 카테고리 · 거리 */}
        {(place.subCategory || place.distance) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 30, marginBottom: 2 }}>
            {place.subCategory && (
              <span style={{ fontSize: 12, color: '#888' }}>{place.subCategory}</span>
            )}
            {place.subCategory && place.distance && (
              <span style={{ fontSize: 11, color: '#ddd' }}>·</span>
            )}
            {place.distance && (
              <span style={{
                fontSize: 12, color: isSelected ? accentColor : '#888',
                fontWeight: isSelected ? 600 : 400,
                transition: 'color 0.2s',
              }}>
                {place.distance}
              </span>
            )}
          </div>
        )}
        {/* 주소 */}
        {place.address && (
          <div style={{ paddingLeft: 30 }}>
            <span style={{ fontSize: 12, color: '#bbb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', display: 'block' }}>
              {place.address}
            </span>
          </div>
        )}

        {/* 추천 이유 */}
        {place.description && (
          <p style={{
            margin: '6px 0 0', paddingLeft: 30,
            fontSize: 12, color: '#999', lineHeight: 1.5, wordBreak: 'keep-all',
          }}>
            {place.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── PlaceScreen ──────────────────────────────────────────────────────────────

export default function PlaceScreen({ stationName, stationRank, hadExplicitSelection, result, onBack, onReset }: Props) {
  const [category,      setCategory]      = useState<Category>('카페');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rawPlaces,     setRawPlaces]     = useState<Place[]>([]);
  const [sortKey,       setSortKey]       = useState<SortKey>('recommend');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const abortRef          = useRef<AbortController | null>(null);
  const viewFiredRef      = useRef(false);
  const usedAutoSelectedRef = useRef(true);

  const accentColor = color.accent;
  const originCoords = getOriginCoords(result);

  useEffect(() => { trackPageView('Place', '/place'); }, []);

  useEffect(() => {
    if (loading || viewFiredRef.current) return;
    viewFiredRef.current = true;
    console.log('Firing event: place_view', { station: stationName, rank: stationRank, place_count: rawPlaces.length, had_explicit_selection: hadExplicitSelection });
    trackEvent('place_view', { station: stationName, rank: stationRank, place_count: rawPlaces.length, had_explicit_selection: hadExplicitSelection });
  }, [loading, rawPlaces]);
  const places = sortPlaces(rawPlaces, sortKey, originCoords);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef  = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setSelectedIndex(0);
    setSortKey('recommend');

    searchPlacesByStation(stationName, category)
      .then((results) => {
        const finalPlaces = results.length > 0 ? results : getPlacesByStation(stationName, category);
        setRawPlaces(finalPlaces);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setRawPlaces(getPlacesByStation(stationName, category));
        setError('장소 정보를 불러오지 못했습니다. 기본 데이터를 표시합니다.');
        setLoading(false);
      });

    return () => abortRef.current?.abort();
  }, [stationName, category]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    console.log('Firing event: category_click', { category: cat });
    trackEvent('category_click', { category: cat });
  };

  const handleCardClick = (i: number, scroll = false) => {
    setSelectedIndex(i);
    usedAutoSelectedRef.current = false;
    const sort_mode = sortKey === 'recommend' ? 'recommended' : 'distance';
    console.log('Firing event: place_select', { name: places[i]?.name, category, index: i, station: stationName, distance_from_station: places[i]?.distance, sort_mode });
    trackEvent('place_select', { name: places[i]?.name, category, index: i, station: stationName, distance_from_station: places[i]?.distance, sort_mode });
    if (scroll) {
      const card = cardRefs.current[i];
      const list = listRef.current;
      if (card && list) {
        const top = card.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop - 8;
        list.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25 } }}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 16, background: color.bgPage,
      }}
    >
      <style>{spinnerCss}</style>
      <div style={{
        width: 28, height: 28,
        border: '2.5px solid #e8e8e8',
        borderTopColor: color.accent,
        borderRadius: '50%',
        animation: 'ps-spin 0.75s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: '#888', fontWeight: 400, margin: 0 }}>근처 장소 탐색 중…</p>
    </motion.div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* 헤더 */}
      <div style={{ flexShrink: 0, padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 0' }}>
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          style={buttonStyle.ghost}
        >
          ← 결과로 돌아가기
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginBottom: 18 }}
        >
          <span style={{
            display: 'inline-block',
            background: color.accent,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            marginBottom: 10,
            letterSpacing: 0.2,
          }}>
            place!
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.2, letterSpacing: -0.5 }}>
            어디서 만날까요?
          </h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 6, marginBottom: 0 }}>
            {stationName} 주변
          </p>
        </motion.div>

        {/* 카테고리 탭 */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${color.border}` }}>
          {CATEGORIES.map((cat) => {
            const active = cat === category;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  flex: 1, padding: '13px 0',
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: active ? 700 : 400,
                  color: active ? color.accent : '#aaa',
                  borderBottom: active ? `2.5px solid ${color.accent}` : '2.5px solid transparent',
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

      {/* 지도 + 정렬바 — 고정 영역 */}
      <div style={{ flexShrink: 0, padding: '12px clamp(16px, 5vw, 28px) 0' }}>
        {error && (
          <div style={{
            marginBottom: 12, padding: '10px 14px',
            background: '#fff8f0', border: '1px solid #ffd8a8',
            borderRadius: 10, fontSize: 12, color: '#c47f00',
          }}>
            {error}
          </div>
        )}
        <KakaoMap
          places={places}
          selectedIndex={selectedIndex}
          onMarkerClick={(i) => handleCardClick(i, true)}
          accentColor={accentColor}
          height="clamp(150px, 36vw, 196px)"
        />
        {places.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: '#bbb', marginRight: 2 }}>정렬</span>
            {(['recommend', 'distance'] as SortKey[]).map((key) => {
              const label = key === 'recommend' ? '추천순' : '가까운순';
              const active = sortKey === key;
              return (
                <button
                  key={key}
                  onClick={() => { setSortKey(key); setSelectedIndex(0); }}
                  style={{
                    padding: '4px 10px',
                    border: active ? `1px solid ${accentColor}` : '1px solid #e8e8e8',
                    borderRadius: 14,
                    background: active ? `${accentColor}10` : '#fff',
                    fontSize: 12, color: active ? accentColor : '#999',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 카드 리스트 — 독립 스크롤 영역 */}
      <div
        ref={listRef}
        style={{ flex: 1, overflowY: 'auto', padding: '10px clamp(16px, 5vw, 28px) 90px' }}
      >
        {places.length === 0 ? (
          <div style={{ paddingTop: 60, textAlign: 'center', color: '#bbb', fontSize: 14 }}>
            주변 장소 정보가 없습니다
          </div>
        ) : (
          places.map((place, i) => (
            <motion.div
              key={place.name}
              ref={(el) => { cardRefs.current[i] = el as HTMLDivElement | null; }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <PlaceCard
                place={place}
                index={i}
                isSelected={i === selectedIndex}
                accentColor={accentColor}
                usedAutoSelected={usedAutoSelectedRef.current}
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
            onClick={() => {
              console.log('Firing event: place_retry_click', { station: stationName, rank: stationRank });
              trackEvent('place_retry_click', { station: stationName, rank: stationRank });
              onReset();
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            style={buttonStyle.secondaryCta}
          >
            다시 찾기
          </motion.button>
        </div>
      </div>
    </div>
  );
}
