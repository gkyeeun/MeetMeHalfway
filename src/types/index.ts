import type { CandidateStation } from './subway';

export interface MiddleResult {
  candidates: CandidateStation[];
  origins: string[];   // 실제 역명 ["강남", "홍대입구"]
  names?: string[];    // 사용자 표시 이름 ["김민준", "이서연"]
}

export interface Place {
  name: string;
  rating: number;
  category: string;
  distance: string;
  description?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
}

export type Category = '카페' | '맛집' | '술집';
