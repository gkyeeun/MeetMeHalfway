import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GRAPH } from '../services/graphBuilder';
import { SUBWAY_GRAPH } from '../data/subwayGraph';

// ─── 모듈 로드 시 한 번만 계산 ───────────────────────────────────────────────

/** edge가 있는 역명만 (고립 노드·서울 외 구간 제외) */
const REACHABLE_NAMES: string[] = Object.keys(SUBWAY_GRAPH.nameIndex).filter((name) =>
  GRAPH.findByName(name).some((n) => GRAPH.getNeighbors(n.id).length > 0)
);

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface AutocompleteItem {
  name: string;
  displayLines: string; // "2호선" | "2호선·경의중앙선"
}

// ─── 검색 함수 ────────────────────────────────────────────────────────────────

function searchStations(query: string): AutocompleteItem[] {
  const q = query.trim();
  if (!q) return [];

  // 앞글자 일치 우선, 포함 일치 후순위
  const byLen    = (a: string, b: string) => a.length - b.length;
  const starts   = REACHABLE_NAMES.filter((n) => n.startsWith(q)).sort(byLen);
  const contains = REACHABLE_NAMES.filter((n) => !n.startsWith(q) && n.includes(q)).sort(byLen);

  return [...starts, ...contains].slice(0, 8).map((name) => {
    const nodes = GRAPH.findByName(name);
    const seen  = new Set<number>();
    const labels: string[] = [];
    for (const n of nodes) {
      if (!seen.has(n.line)) { seen.add(n.line); labels.push(n.lineName); }
    }
    return { name, displayLines: labels.join('·') };
  });
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

interface Props {
  value: string;
  onChange: (value: string) => void;
  onConfirm?: () => void;
  onReset?: () => void;
  placeholder?: string;
  index: number;
}

export default function StationInput({ value, onChange, onConfirm, onReset, placeholder, index }: Props) {
  const [query,       setQuery]       = useState(value);
  const [items,       setItems]       = useState<AutocompleteItem[]>([]);
  const [open,        setOpen]        = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [focused,     setFocused]     = useState(false);

  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 외부 value 변경 동기화
  useEffect(() => { setQuery(value); }, [value]);

  // 역 선택 (클릭 / 엔터 공통)
  const handleSelect = useCallback((name: string) => {
    setQuery(name);
    onChange(name);
    onConfirm?.();
    setItems([]);
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.blur();
  }, [onChange, onConfirm]);

  // 입력 변경 + 디바운스 검색
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    onChange(q);
    onReset?.();
    setHighlighted(-1);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const results = searchStations(q);
      setItems(results);
      setOpen(results.length > 0);
    }, 200);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (highlighted >= 0) {
        e.preventDefault();
        handleSelect(items[highlighted].name);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  // 지우기
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault(); // blur 방지
    setQuery('');
    onChange('');
    setItems([]);
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* ── 입력 박스 ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: focused ? '#4F46E5' : '#e0e0e0',
        borderRadius: 8,
        padding: '12px 14px',
        background: '#fff',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
      }}>
        <span style={{
          fontSize: 12, color: '#999', marginRight: 10,
          minWidth: 16, textAlign: 'center',
        }}>
          {index + 1}
        </span>

        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); if (query.trim() && items.length > 0) setOpen(true); }}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
          placeholder={placeholder ?? '출발역 입력'}
          autoComplete="off"
          style={{
            border: 'none', outline: 'none',
            fontSize: 15, flex: 1,
            background: 'transparent', color: '#111',
          }}
        />

        {query && (
          <button
            onMouseDown={handleClear}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              padding: 0, color: '#bbb', fontSize: 16, lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── 자동완성 드롭다운 ──────────────────────────────────────────────── */}
      {open && items.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%', left: 0, right: 0,
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          marginTop: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {items.map((item, i) => {
            const isHighlighted = i === highlighted;
            return (
              <button
                key={item.name}
                onMouseDown={() => handleSelect(item.name)}
                onMouseEnter={() => setHighlighted(i)}
                onMouseLeave={() => setHighlighted(-1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '11px 14px',
                  border: 'none',
                  borderBottom: '1px solid #f5f5f5',
                  background: isHighlighted ? '#f5f5f5' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* 역명 */}
                <span style={{
                  fontSize: 14,
                  color: '#111',
                  fontWeight: isHighlighted ? 600 : 400,
                }}>
                  {item.name}
                </span>

                {/* 호선 뱃지 */}
                <span style={{
                  fontSize: 11,
                  color: '#666',
                  background: isHighlighted ? '#e8e8e8' : '#f0f0f0',
                  borderRadius: 4,
                  padding: '2px 7px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  marginLeft: 8,
                }}>
                  {item.displayLines}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
