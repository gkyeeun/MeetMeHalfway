export interface Place {
  name: string;
  rating: number;
  category: string;
  distance: string;
  lat: number;
  lng: number;
}

export interface MiddleResult {
  middleStation: string;
  travelTimes: number[];
  origins: string[];
  names: string[];
}

export type Category = '카페' | '맛집' | '술집';
