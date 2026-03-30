import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const rawUrl = req.url ?? '/';
  const queryString = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : '';

  const kakaoRes = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json${queryString}`,
    {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_KEY}`,
      },
    },
  );

  const body = await kakaoRes.text();
  res.statusCode = kakaoRes.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body);
}
