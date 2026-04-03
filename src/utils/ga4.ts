// GA4 event tracking (ready structure — swap in actual gtag when deploying)
type EventName =
  | 'origin_input_complete'
  | 'origin_complete'
  | 'calculate_middle_click'
  | 'calculate_middle'
  | 'middle_result_view'
  | 'result_select'
  | 'category_click'
  | 'place_click'
  | 'place_select'
  | 'route_click'
  | 'recalculate_click'
  | 'explore_click'
  | 'kakaomap_click'
  | 'map_click'
  | 'share_click';


interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(name: EventName, params?: EventParams): void {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
    (window as unknown as { gtag: Function }).gtag('event', name, params);
  } else {
    // Dev logging
    console.log('[GA4]', name, params);
  }
}

export function trackPageView(page_title: string, page_path: string): void {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
    (window as unknown as { gtag: Function }).gtag('event', 'page_view', { page_title, page_path });
  } else {
    console.log('[GA4] page_view', { page_title, page_path });
  }
}
