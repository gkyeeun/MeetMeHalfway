import { useEffect, useRef, useState } from 'react';
import type { Place } from '../types';

declare global {
  interface Window { kakao: any; }
}

const APPKEY = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;

interface Props {
  places: Place[];
  selectedIndex: number;
  onMarkerClick: (i: number) => void;
  accentColor: string;
  height?: string;
}

function makeMarkerEl(num: number, isSelected: boolean, color: string): HTMLElement {
  const size = isSelected ? 32 : 26;
  const bg   = isSelected ? color : '#666';
  const el   = document.createElement('div');
  el.style.cssText = `
    width:${size}px;height:${size}px;
    background:${bg};border-radius:50%;
    border:2.5px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.28);
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-size:${isSelected ? 13 : 11}px;font-weight:700;
    font-family:sans-serif;
    transform:translate(-50%,-50%);
    cursor:pointer;
    transition:background 0.15s;
  `;
  el.textContent = String(num);
  return el;
}

type ErrorKind =
  | 'NO_KEY'
  | 'SDK_LOAD_FAILED'
  | 'NO_KAKAO_OBJECT'
  | 'MAPS_LOAD_NOT_CALLED'
  | 'NO_COORDS';

const ERROR_MSG: Record<ErrorKind, string> = {
  NO_KEY:               '지도 API 키가 없습니다 (VITE_KAKAO_MAP_KEY)',
  SDK_LOAD_FAILED:      'SDK 로드 실패 — 키 또는 허용 도메인을 확인하세요',
  NO_KAKAO_OBJECT:      'window.kakao 객체가 없습니다',
  MAPS_LOAD_NOT_CALLED: 'kakao.maps.load 콜백이 실행되지 않았습니다',
  NO_COORDS:            '좌표가 있는 장소가 없습니다',
};

export default function KakaoMap({ places, selectedIndex, onMarkerClick, accentColor, height }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const overlaysRef  = useRef<any[]>([]);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);

  const onClickRef = useRef(onMarkerClick);
  useEffect(() => { onClickRef.current = onMarkerClick; }, [onMarkerClick]);

  const withCoords = places
    .map((p, i) => ({ p, idx: i }))
    .filter(({ p }) => p.lat != null && p.lng != null);

  function rebuildOverlays(map: any, curSelected: number, curColor: string) {
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];
    if (withCoords.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    withCoords.forEach(({ p, idx }) => {
      const pos = new window.kakao.maps.LatLng(p.lat!, p.lng!);
      const el  = makeMarkerEl(idx + 1, idx === curSelected, curColor);
      el.addEventListener('click', () => onClickRef.current(idx));
      bounds.extend(pos);
      const overlay = new window.kakao.maps.CustomOverlay({
        position: pos, content: el, map,
        zIndex: idx === curSelected ? 10 : 1,
        yAnchor: 0.5, xAnchor: 0.5,
      });
      overlaysRef.current.push(overlay);
    });
    if (withCoords.length > 1) map.setBounds(bounds);
  }

  useEffect(() => {
    // ① 키 확인
    console.log('[KakaoMap] ① APPKEY:', APPKEY ? `"${APPKEY.slice(0, 6)}…"` : '❌ undefined');
    if (!APPKEY) {
      console.error('[KakaoMap] VITE_KAKAO_MAP_KEY 미설정 — .env 파일 확인');
      setErrorKind('NO_KEY');
      return;
    }

    // ② 좌표 확인
    console.log('[KakaoMap] ② withCoords.length:', withCoords.length);
    if (withCoords.length === 0) {
      console.warn('[KakaoMap] 좌표 있는 장소 없음');
      setErrorKind('NO_COORDS');
      return;
    }

    const doInit = () => {
      // ④ window.kakao 확인
      console.log('[KakaoMap] ④ window.kakao:', typeof window.kakao);
      if (!window.kakao) {
        console.error('[KakaoMap] window.kakao 없음 — SDK onload 이후에도 미정의');
        setErrorKind('NO_KAKAO_OBJECT');
        return;
      }

      // ⑤ kakao.maps 확인
      console.log('[KakaoMap] ⑤ window.kakao.maps:', typeof window.kakao.maps);

      // ⑥ maps.load 호출
      console.log('[KakaoMap] ⑥ calling kakao.maps.load…');
      const loadTimeout = setTimeout(() => {
        if (!mapRef.current) {
          console.error('[KakaoMap] maps.load 콜백 3초 내 미실행 — 도메인 허용 여부 확인');
          setErrorKind('MAPS_LOAD_NOT_CALLED');
        }
      }, 3000);

      window.kakao.maps.load(() => {
        clearTimeout(loadTimeout);
        console.log('[KakaoMap] ⑥ maps.load callback ✓');

        // ⑦ container ref 확인
        console.log('[KakaoMap] ⑦ containerRef.current:', containerRef.current);
        if (!containerRef.current) {
          console.error('[KakaoMap] container DOM 없음 — 컴포넌트 언마운트 여부 확인');
          return;
        }

        const { lat, lng } = withCoords[0].p;
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(lat!, lng!),
          level: 4,
        });
        mapRef.current = map;
        console.log('[KakaoMap] ✅ map created');
        rebuildOverlays(map, selectedIndex, accentColor);
      });
    };

    // ③ script 주입 분기
    if (window.kakao) {
      console.log('[KakaoMap] ③ kakao already on window → skip script inject');
      doInit();
    } else if (!document.querySelector('[data-kakao-map-sdk]')) {
      console.log('[KakaoMap] ③ injecting SDK script tag');
      const s = document.createElement('script');
      s.setAttribute('data-kakao-map-sdk', '');
      s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${APPKEY}&autoload=false`;
      s.onload = () => {
        console.log('[KakaoMap] ③ script onload fired');
        doInit();
      };
      s.onerror = () => {
        console.error('[KakaoMap] ③ script onerror — 키 오류 또는 네트워크 문제');
        setErrorKind('SDK_LOAD_FAILED');
      };
      document.head.appendChild(s);
      console.log('[KakaoMap] ③ script tag appended to head');
    } else {
      console.log('[KakaoMap] ③ script tag exists, polling for window.kakao…');
      const timer = setInterval(() => {
        if (window.kakao) { clearInterval(timer); console.log('[KakaoMap] ③ poll resolved'); doInit(); }
      }, 50);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    rebuildOverlays(mapRef.current, selectedIndex, accentColor);
    const found = withCoords.find(({ idx }) => idx === selectedIndex);
    if (found) mapRef.current.panTo(new window.kakao.maps.LatLng(found.p.lat!, found.p.lng!));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, selectedIndex, accentColor]);

  const wrapStyle: React.CSSProperties = {
    height: height ?? 'clamp(180px, 45vw, 240px)',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  };

  if (errorKind) {
    return (
      <div style={{ ...wrapStyle, background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 12, color: '#bbb', margin: 0, textAlign: 'center', padding: '0 24px' }}>
          {ERROR_MSG[errorKind]}
        </p>
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div style={{ ...wrapStyle, background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>지도 정보 없음</p>
      </div>
    );
  }

  return <div ref={containerRef} style={{ ...wrapStyle, background: '#e8e8e8' }} />;
}
