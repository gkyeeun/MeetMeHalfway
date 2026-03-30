// GA4 event tracking (ready structure — swap in actual gtag when deploying)
type EventName =
  | 'origin_input_complete'
  | 'calculate_middle_click'
  | 'middle_result_view'
  | 'category_click'
  | 'place_click'
  | 'route_click'
  | 'recalculate_click'
  | 'explore_click'
  | 'kakaomap_click'
  | 'kakao_share_click'
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
