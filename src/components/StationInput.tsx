import React, { useState, useRef, useEffect } from 'react';
import { STATION_LIST } from '../data/stations';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  index: number;
}

export default function StationInput({ value, onChange, placeholder, index }: Props) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = query.length > 0
    ? STATION_LIST.filter((s) => s.includes(query) && s !== query).slice(0, 5)
    : [];

  const handleSelect = (station: string) => {
    setQuery(station);
    onChange(station);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: focused ? '#111' : '#e0e0e0',
        borderRadius: 8,
        padding: '12px 14px',
        background: '#fff',
        transition: 'border-color 0.15s',
      }}>
        <span style={{
          fontSize: 12,
          color: '#999',
          marginRight: 10,
          minWidth: 16,
          textAlign: 'center',
        }}>
          {index + 1}
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder || '출발역 입력'}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: 15,
            flex: 1,
            background: 'transparent',
            color: '#111',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); onChange(''); }}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#bbb',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>
      {focused && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          marginTop: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {filtered.map((station) => (
            <button
              key={station}
              onMouseDown={() => handleSelect(station)}
              style={{
                display: 'block',
                width: '100%',
                padding: '11px 14px',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: '#333',
                borderBottom: '1px solid #f5f5f5',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9f9f9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {station}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
