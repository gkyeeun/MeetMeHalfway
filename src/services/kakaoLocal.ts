import type { Place, Category } from '../types';

const CATEGORY_KEYWORD: Record<Category, string> = {
  카페: '카페',
  맛집: '맛집',
  술집: '술집',
};

interface KakaoDoc {
  place_name: string;
  category_name: string;
  road_address_name: string;
  address_name: string;
  x: string; // lng
  y: string; // lat
  place_url: string;
  distance: string;
}

export async function searchPlacesByStation(
  stationName: string,
  category: Category,
): Promise<Place[]> {
  const query = `${stationName}역 ${CATEGORY_KEYWORD[category]}`;
  const params = new URLSearchParams({ query, size: '15' });

  const res = await fetch(`/api/kakao-places?${params}`);
  if (!res.ok) throw new Error(`Kakao Local API ${res.status}`);

  const data = await res.json();
  const docs: KakaoDoc[] = data.documents ?? [];

  return docs
    .filter((d) => d.x && d.y)
    .map((d) => ({
      name: d.place_name,
      category,
      address: d.road_address_name || d.address_name,
      lat: parseFloat(d.y),
      lng: parseFloat(d.x),
      placeUrl: d.place_url,
      distance: d.distance ? `${Math.round(Number(d.distance))}m` : undefined,
    }));
}
