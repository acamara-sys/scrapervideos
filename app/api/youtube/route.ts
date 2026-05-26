import { NextResponse } from 'next/server';

type VideoItem = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string | null;
};

function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] ?? '0');
  const m = parseInt(match[2] ?? '0');
  const s = parseInt(match[3] ?? '0');
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const keyword = url.searchParams.get('keyword') || '';

    if (!keyword) {
      return NextResponse.json({ error: 'keyword is required' }, { status: 400 });
    }

    const key = process.env.API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Missing API_KEY' }, { status: 500 });
    }

    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: keyword,
      type: 'video',
      maxResults: '12',
      videoEmbeddable: 'true',
      key,
    });

    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`);
    if (!searchRes.ok) {
      const text = await searchRes.text();
      return NextResponse.json({ error: 'YouTube API error', details: text }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const videoIds: string[] = (searchData.items || [])
      .map((it: any) => it.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) return NextResponse.json({ items: [] });

    const detailsParams = new URLSearchParams({
      part: 'contentDetails',
      id: videoIds.join(','),
      key,
    });

    const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${detailsParams}`);
    const detailsData = detailsRes.ok ? await detailsRes.json() : { items: [] };

    const durationMap: Record<string, string> = {};
    for (const item of detailsData.items || []) {
      durationMap[item.id] = parseIsoDuration(item.contentDetails?.duration ?? '');
    }

    const items: VideoItem[] = (searchData.items || []).map((it: any) => ({
      id: it.id?.videoId,
      title: it.snippet?.title,
      channelTitle: it.snippet?.channelTitle,
      thumbnail: it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url || '',
      duration: durationMap[it.id?.videoId] ?? null,
    }));

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
