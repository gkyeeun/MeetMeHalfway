export const LINE_COLORS: Record<number, string> = {
  1:  '#0052A4',
  2:  '#00A84D',
  3:  '#EF7C1C',
  4:  '#00A5DE',
  5:  '#996CAC',
  6:  '#CD7C2F',
  7:  '#747F00',
  8:  '#E6186C',
  9:  '#BDB092',
  10: '#759CCE', // 인천1호선
  11: '#F5A200', // 인천2호선
  12: '#0054A6', // 경강선
  13: '#73C8A9', // 경의중앙선
  14: '#30B890', // 경춘선
  15: '#0090D2', // 공항철도
  16: '#8FC31F', // 서해선
  17: '#FABE00', // 수인분당선
  18: '#D4003B', // 신분당선
  19: '#6789CA', // 신림선
  20: '#B0C432', // 우이신설선
  21: '#AD8605', // 김포골드라인
  22: '#77C4A3', // 용인에버라인
  23: '#FDA600', // 의정부경전철
  24: '#9E5C25', // GTX-A
};

export function getLineColor(line: number): string {
  return LINE_COLORS[line] ?? '#888888';
}
