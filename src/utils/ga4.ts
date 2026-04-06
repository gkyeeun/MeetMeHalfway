// GA4 event tracking (ready structure — swap in actual gtag when deploying)


type EventName =
  | 'origin_complete'
  | 'calculate_middle'
  | 'result_view'
  | 'result_exit'
  | 'result_select'
  | 'explore_click'
  | 'place_view'
  | 'place_select'
  | 'route_click'
  | 'map_click'
  | 'share_click'
  | 'category_click';


interface EventParams {
  [key: string]: string | number | boolean | null | undefined;
}

const isDebug = typeof window !== 'undefined' && window.location.search.includes('debug_mode=true');

// Re-configure gtag with debug_mode so DebugView receives events
if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
  (window as unknown as { gtag: Function }).gtag('config', 'G-R77MWE8VM7', {
    debug_mode: isDebug,
  });
}

export function trackEvent(name: EventName, params?: EventParams): void {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
    (window as unknown as { gtag: Function }).gtag('event', name, { ...params, debug_mode: isDebug });
  } else {
    // Dev logging
    console.log('[GA4]', name, params);
  }
}

export function trackPageView(page_title: string, page_path: string): void {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
    (window as unknown as { gtag: Function }).gtag('event', 'page_view', { page_title, page_path, debug_mode: isDebug });
  } else {
    console.log('[GA4] page_view', { page_title, page_path });
  }
}
