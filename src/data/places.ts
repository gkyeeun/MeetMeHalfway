import type { Place } from '../types';

// Mock place data keyed by station name
const PLACES_BY_STATION: Record<string, Place[]> = {
  강남: [
    { name: '블루보틀 강남점', rating: 4.5, category: '카페', distance: '도보 3분', description: '스페셜티 원두로 내린 드립 커피 전문점', lat: 37.4979, lng: 127.0276 },
    { name: '스타벅스 강남대로점', rating: 4.2, category: '카페', distance: '도보 5분', description: '대로변 대형 매장, 좌석 여유 있음', lat: 37.4982, lng: 127.0271 },
    { name: '더플레이스', rating: 4.6, category: '맛집', distance: '도보 7분', description: '제철 재료를 활용한 모던 한식 코스', lat: 37.4975, lng: 127.0280 },
    { name: '모수', rating: 4.8, category: '맛집', distance: '도보 10분', description: '미쉐린 셰프가 운영하는 파인다이닝', lat: 37.4990, lng: 127.0265 },
    { name: '르 챔버', rating: 4.7, category: '술집', distance: '도보 5분', description: '비밀스러운 분위기의 클래식 칵테일 바', lat: 37.4985, lng: 127.0270 },
    { name: '익스퀴진', rating: 4.4, category: '술집', distance: '도보 8분', description: '가벼운 안주와 와인을 즐기기 좋은 비스트로', lat: 37.4972, lng: 127.0285 },
  ],
  홍대입구: [
    { name: '연남동 카페 FRITZ', rating: 4.6, category: '카페', distance: '도보 5분', description: '덴마크 감성의 스페셜티 로스터리', lat: 37.5575, lng: 126.9237 },
    { name: '카페 온도', rating: 4.3, category: '카페', distance: '도보 3분', description: '아늑한 인테리어의 동네 카페', lat: 37.5578, lng: 126.9250 },
    { name: '홍대 양꼬치거리', rating: 4.4, category: '맛집', distance: '도보 7분', description: '활기찬 거리의 중국식 양꼬치', lat: 37.5565, lng: 126.9230 },
    { name: '경성양꼬치', rating: 4.5, category: '맛집', distance: '도보 6분', description: '숯불 직화 양꼬치와 칭따오 조합', lat: 37.5570, lng: 126.9240 },
    { name: '에디오피아', rating: 4.6, category: '술집', distance: '도보 4분', description: '홍대 대표 소규모 라이브 클럽 바', lat: 37.5580, lng: 126.9245 },
    { name: '수상한포차', rating: 4.2, category: '술집', distance: '도보 8분', description: '강변 감성 인테리어의 포차 느낌 술집', lat: 37.5560, lng: 126.9235 },
  ],
  신촌: [
    { name: '카페 드롭탑', rating: 4.1, category: '카페', distance: '도보 4분', lat: 37.5558, lng: 126.9366 },
    { name: '커피빈 신촌점', rating: 4.0, category: '카페', distance: '도보 6분', lat: 37.5560, lng: 126.9370 },
    { name: '신촌 설렁탕', rating: 4.5, category: '맛집', distance: '도보 5분', lat: 37.5555, lng: 126.9360 },
    { name: '육전식당', rating: 4.6, category: '맛집', distance: '도보 8분', lat: 37.5562, lng: 126.9355 },
    { name: '포차 골목', rating: 4.3, category: '술집', distance: '도보 6분', lat: 37.5550, lng: 126.9368 },
    { name: '오픈하우스', rating: 4.4, category: '술집', distance: '도보 7분', lat: 37.5558, lng: 126.9362 },
  ],
  합정: [
    { name: '카페 어니언', rating: 4.7, category: '카페', distance: '도보 6분', lat: 37.5496, lng: 126.9131 },
    { name: '망원 할머니 커피', rating: 4.5, category: '카페', distance: '도보 8분', lat: 37.5500, lng: 126.9125 },
    { name: '망원 시장 맛집거리', rating: 4.4, category: '맛집', distance: '도보 10분', lat: 37.5488, lng: 126.9140 },
    { name: '리틀넥', rating: 4.6, category: '맛집', distance: '도보 5분', lat: 37.5502, lng: 126.9135 },
    { name: '펠리컨', rating: 4.7, category: '술집', distance: '도보 6분', lat: 37.5494, lng: 126.9128 },
    { name: '만달레이', rating: 4.5, category: '술집', distance: '도보 9분', lat: 37.5506, lng: 126.9120 },
  ],
  여의도: [
    { name: '스타벅스 여의도 파크점', rating: 4.2, category: '카페', distance: '도보 5분', lat: 37.5219, lng: 126.9245 },
    { name: '바나프레소', rating: 4.0, category: '카페', distance: '도보 3분', lat: 37.5222, lng: 126.9250 },
    { name: '여의도 국회 순대국', rating: 4.3, category: '맛집', distance: '도보 7분', lat: 37.5215, lng: 126.9238 },
    { name: '한강공원 치킨', rating: 4.4, category: '맛집', distance: '도보 12분', lat: 37.5200, lng: 126.9270 },
    { name: 'IFC 몰 레스토랑', rating: 4.5, category: '술집', distance: '도보 4분', lat: 37.5225, lng: 126.9255 },
    { name: '바 여의도', rating: 4.3, category: '술집', distance: '도보 8분', lat: 37.5210, lng: 126.9242 },
  ],
  성수: [
    { name: '대림창고 카페', rating: 4.5, category: '카페', distance: '도보 8분', lat: 37.5440, lng: 127.0560 },
    { name: '아크앤북 성수', rating: 4.4, category: '카페', distance: '도보 5분', lat: 37.5445, lng: 126.0555 },
    { name: '성수 연방', rating: 4.6, category: '맛집', distance: '도보 6분', lat: 37.5435, lng: 127.0565 },
    { name: '장인어른', rating: 4.7, category: '맛집', distance: '도보 9분', lat: 37.5450, lng: 127.0548 },
    { name: '아이엠바', rating: 4.5, category: '술집', distance: '도보 7분', lat: 37.5442, lng: 127.0558 },
    { name: '게스트하우스 성수', rating: 4.3, category: '술집', distance: '도보 10분', lat: 37.5430, lng: 127.0570 },
  ],
  왕십리: [
    { name: '카페 모어', rating: 4.2, category: '카페', distance: '도보 4분', description: '조용한 2층 공간, 작업하기 좋은 카페', lat: 37.5617, lng: 127.0367 },
    { name: '이디야 왕십리점', rating: 3.9, category: '카페', distance: '도보 3분', description: '역 인근 접근성 좋은 프랜차이즈 카페', lat: 37.5620, lng: 127.0370 },
    { name: '왕십리 곱창골목', rating: 4.5, category: '맛집', distance: '도보 6분', description: '오래된 골목에 즐비한 곱창·대창 집들', lat: 37.5610, lng: 127.0360 },
    { name: '하남돼지집 왕십리', rating: 4.4, category: '맛집', distance: '도보 8분', description: '두꺼운 생삼겹살과 목살 전문점', lat: 37.5625, lng: 127.0355 },
    { name: '골든티켓', rating: 4.3, category: '술집', distance: '도보 5분', description: '크래프트 맥주 20종 이상 상시 보유', lat: 37.5615, lng: 127.0365 },
    { name: '더 부스 왕십리', rating: 4.4, category: '술집', distance: '도보 7분', description: '미국 감성 버거 & 수제맥주 펍', lat: 37.5608, lng: 127.0372 },
  ],
  사당: [
    { name: '투썸플레이스 사당점', rating: 4.1, category: '카페', distance: '도보 3분', lat: 37.4770, lng: 126.9815 },
    { name: '할리스 사당역점', rating: 4.0, category: '카페', distance: '도보 5분', lat: 37.4773, lng: 126.9820 },
    { name: '사당 양꼬치', rating: 4.3, category: '맛집', distance: '도보 7분', lat: 37.4765, lng: 126.9810 },
    { name: '돈부리 사당', rating: 4.4, category: '맛집', distance: '도보 9분', lat: 37.4778, lng: 126.9808 },
    { name: '사당 술집거리', rating: 4.2, category: '술집', distance: '도보 6분', lat: 37.4768, lng: 126.9818 },
    { name: '갑을포차', rating: 4.3, category: '술집', distance: '도보 8분', lat: 37.4762, lng: 126.9825 },
  ],
  서울역: [
    { name: '카페 서울로', rating: 4.3, category: '카페', distance: '도보 5분', description: '서울로 7017 위 루프탑 감성 카페', lat: 37.5547, lng: 126.9705 },
    { name: '스타벅스 서울역점', rating: 4.1, category: '카페', distance: '도보 3분', description: '서울역 환승센터 내 대형 매장', lat: 37.5550, lng: 126.9710 },
    { name: '해장국 서울역', rating: 4.4, category: '맛집', distance: '도보 6분', description: '진한 뼈해장국 한 그릇이 든든한 집', lat: 37.5542, lng: 126.9698 },
    { name: '남대문 갈치조림', rating: 4.5, category: '맛집', distance: '도보 10분', description: '60년 전통의 갈치조림 전문 노포', lat: 37.5533, lng: 126.9750 },
    { name: '서울역 포차', rating: 4.1, category: '술집', distance: '도보 7분', description: '직장인들의 퇴근 후 단골 포장마차', lat: 37.5555, lng: 126.9702 },
    { name: '이태원 클라쓰', rating: 4.3, category: '술집', distance: '도보 9분', description: '다양한 나라의 에일을 즐길 수 있는 바', lat: 37.5540, lng: 126.9715 },
  ],
  시청: [
    { name: '카페 명동', rating: 4.2, category: '카페', distance: '도보 5분', description: '명동 한복판, 시끄럽지만 접근성 최고', lat: 37.5638, lng: 126.9761 },
    { name: '폴 바셋 시청점', rating: 4.4, category: '카페', distance: '도보 4분', description: '호주 바리스타 폴 바셋 원두를 사용한 커피', lat: 37.5640, lng: 126.9765 },
    { name: '명동교자', rating: 4.7, category: '맛집', distance: '도보 8분', description: '줄 서도 먹는 칼국수·만두 국민 맛집', lat: 37.5630, lng: 126.9850 },
    { name: '을지면옥', rating: 4.6, category: '맛집', distance: '도보 10분', description: '50년 넘은 냉면 전문 노포', lat: 37.5660, lng: 126.9900 },
    { name: '시청 루프탑 바', rating: 4.4, category: '술집', distance: '도보 6분', description: '서울 야경을 내려다보며 즐기는 루프탑 바', lat: 37.5642, lng: 126.9758 },
    { name: '소호 재즈바', rating: 4.5, category: '술집', distance: '도보 9분', description: '라이브 재즈 연주가 있는 분위기 있는 바', lat: 37.5635, lng: 126.9770 },
  ],
  종각: [
    { name: '카페 익선다다', rating: 4.5, category: '카페', distance: '도보 6분', lat: 37.5752, lng: 126.9860 },
    { name: '피카부', rating: 4.3, category: '카페', distance: '도보 8분', lat: 37.5748, lng: 126.9868 },
    { name: '익선동 한옥 맛집', rating: 4.6, category: '맛집', distance: '도보 8분', lat: 37.5755, lng: 126.9855 },
    { name: '종로 닭한마리', rating: 4.7, category: '맛집', distance: '도보 7분', lat: 37.5760, lng: 126.9845 },
    { name: '파이브가이즈 종로', rating: 4.4, category: '맛집', distance: '도보 5분', lat: 37.5745, lng: 126.9872 },
    { name: '종로 포장마차', rating: 4.2, category: '술집', distance: '도보 5분', lat: 37.5750, lng: 126.9862 },
    { name: '노포 막걸리집', rating: 4.5, category: '술집', distance: '도보 9분', lat: 37.5758, lng: 126.9848 },
  ],
  혜화: [
    { name: '카페 온당', rating: 4.5, category: '카페', distance: '도보 5분', lat: 37.5822, lng: 127.0016 },
    { name: '마리아주 카페', rating: 4.4, category: '카페', distance: '도보 7분', lat: 37.5825, lng: 127.0010 },
    { name: '혜화 칼국수', rating: 4.6, category: '맛집', distance: '도보 6분', lat: 37.5818, lng: 127.0022 },
    { name: '대학로 삼겹살', rating: 4.3, category: '맛집', distance: '도보 9분', lat: 37.5828, lng: 127.0005 },
    { name: '대학로 소극장 앞 포차', rating: 4.4, category: '술집', distance: '도보 8분', lat: 37.5820, lng: 127.0018 },
    { name: '연극인 막걸리', rating: 4.3, category: '술집', distance: '도보 10분', lat: 37.5815, lng: 127.0025 },
  ],
};

// Default places for stations not in the list
const DEFAULT_PLACES: Place[] = [
  { name: '스타벅스', rating: 4.0, category: '카페', distance: '도보 3분', lat: 37.5665, lng: 126.9780 },
  { name: '이디야커피', rating: 3.8, category: '카페', distance: '도보 5분', lat: 37.5668, lng: 126.9775 },
  { name: '한식당', rating: 4.2, category: '맛집', distance: '도보 7분', lat: 37.5660, lng: 126.9785 },
  { name: '일식 라멘', rating: 4.3, category: '맛집', distance: '도보 8분', lat: 37.5672, lng: 126.9770 },
  { name: '치맥집', rating: 4.1, category: '술집', distance: '도보 5분', lat: 37.5663, lng: 126.9782 },
  { name: '포차 거리', rating: 4.0, category: '술집', distance: '도보 9분', lat: 37.5658, lng: 126.9788 },
];

export function getAllPlacesByStation(station: string): Place[] {
  return PLACES_BY_STATION[station] || DEFAULT_PLACES;
}

export function getPlacesByStation(station: string, category: string): Place[] {
  return getAllPlacesByStation(station)
    .filter((p) => p.category === category)
    .sort((a, b) => b.rating - a.rating);
}
