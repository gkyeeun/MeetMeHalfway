import { useState, useEffect } from 'react';
import { subscribeToLog, type GALogEntry } from '../utils/ga4';

const isDebugUI =
  typeof window !== 'undefined' && window.location.search.includes('debug_ui=true');

export default function DebugOverlay() {
  const [log, setLog] = useState<GALogEntry[]>([]);

  useEffect(() => {
    return subscribeToLog(setLog);
  }, []);

  if (!isDebugUI) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 12,
      right: 12,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.82)',
      borderRadius: 10,
      padding: '10px 12px',
      pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 10, color: '#90ADFB', fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>
        GA DEBUG ({log.length})
      </div>
      {log.length === 0 ? (
        <div style={{ fontSize: 11, color: '#888' }}>no events yet</div>
      ) : (
        log.map((entry, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: '#666', flexShrink: 0 }}>{entry.ts}</span>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{entry.name}</span>
            {entry.params && (
              <span style={{ fontSize: 10, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {JSON.stringify(entry.params)}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
