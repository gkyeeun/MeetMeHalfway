import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CandidateStation } from '../types/subway';

// ─── 커스텀 마커 (이미지 파일 의존성 없음) ────────────────────────────────────

function createRankIcon(rank: number) {
  const size  = rank === 1 ? 34 : 26;
  const bg    = rank === 1 ? '#111' : '#888';
  const font  = rank === 1 ? 14 : 11;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bg};border-radius:50%;
      border:2.5px solid #fff;
      box-shadow:0 2px 10px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:${font}px;font-weight:700;font-family:sans-serif;
    ">${rank}</div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 6)],
  });
}

// ─── fitBounds (candidates 변경 시 지도 범위 자동 조정) ───────────────────────

function FitBounds({ candidates }: { candidates: CandidateStation[] }) {
  const map = useMap();
  useEffect(() => {
    if (candidates.length === 0) return;
    const bounds = L.latLngBounds(candidates.map(c => [c.lat, c.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [map, candidates]);
  return null;
}

// ─── MapView ─────────────────────────────────────────────────────────────────

interface Props {
  candidates: CandidateStation[];
  origins: string[];
  names?: string[];
}

export default function MapView({ candidates, origins, names }: Props) {
  if (candidates.length === 0) return null;

  const displayName = (i: number) => names?.[i]?.trim() || origins[i] || `출발지 ${i + 1}`;

  return (
    <div style={{ height: 220, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
      <MapContainer
        key={candidates.map(c => c.stationId).join(',')}
        center={[candidates[0].lat, candidates[0].lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds candidates={candidates} />
        {candidates.map((c) => (
          <Marker key={c.stationId} position={[c.lat, c.lng]} icon={createRankIcon(c.rank)}>
            <Popup>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <strong>{c.rank}위 — {c.stationName}</strong> ({c.lineName})<br />
                {displayName(0)} → {c.durationFromA}분<br />
                {displayName(1)} → {c.durationFromB}분<br />
                평균 {c.avgDuration}분
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
