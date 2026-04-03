// GA4 event tracking (ready structure — swap in actual gtag when deploying)

// ─── Debug event log (consumed by DebugOverlay) ───────────────────────────────

export interface GALogEntry {
  name: string;
  params?: Record<string, unknown>;
  ts: string; // HH:MM:SS
}

const MAX_LOG = 10;
const eventLog: GALogEntry[] = [];
type LogListener = (log: GALogEntry[]) => void;
const listeners = new Set<LogListener>();

function pushLog(name: string, params?: Record<string, unknown>) {
  const now = new Date();
  const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
  eventLog.unshift({ name, params, ts });
  if (eventLog.length > MAX_LOG) eventLog.pop();
  listeners.forEach((fn) => fn([...eventLog]));
}

export function subscribeToLog(fn: LogListener): () => void {
  listeners.add(fn);
  fn([...eventLog]); // send current log immediately
  return () => listeners.delete(fn);
}

// ─────────────────────────────────────────────────────────────────────────────

type EventName =
  | 'origin_complete'
  | 'calculate_middle'
  | 'result_view'
  | 'result_select'
  | 'explore_click'
  | 'place_select'
  | 'route_click'
  | 'map_click'
  | 'share_click'
  | 'category_click';


interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

const isDebug = typeof window !== 'undefined' && window.location.search.includes('debug_mode=true');

// Re-configure gtag with debug_mode so DebugView receives events
if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
  (window as unknown as { gtag: Function }).gtag('config', 'G-R77MWE8VM7', {
    debug_mode: isDebug,
  });
}

export function trackEvent(name: EventName, params?: EventParams): void {
  pushLog(name, params);
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
    (window as unknown as { gtag: Function }).gtag('event', name, { ...params, debug_mode: isDebug });
  } else {
    // Dev logging
    console.log('[GA4]', name, params);
  }
}

export function trackPageView(page_title: string, page_path: string): void {
  pushLog('page_view', { page_title, page_path });
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
    (window as unknown as { gtag: Function }).gtag('event', 'page_view', { page_title, page_path, debug_mode: isDebug });
  } else {
    console.log('[GA4] page_view', { page_title, page_path });
  }
}
