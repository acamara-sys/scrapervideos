import { NextResponse } from 'next/server';

type VideoItem = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const keyword = url.searchParams.get('keyword') || '';

    if (!keyword) {
      return NextResponse.json({ error: 'keyword is required' }, { status: 400 });
    }

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 500 });
    }

    const params = new URLSearchParams({
      part: 'snippet',
      q: keyword,
      type: 'video',
      maxResults: '12',
      key,
    });

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    const res = await fetch(apiUrl);
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'YouTube API error', details: text }, { status: 502 });
    }

    const data = await res.json();

    const items: VideoItem[] = (data.items || []).map((it: any) => ({
      id: it.id?.videoId,
      title: it.snippet?.title,
      channelTitle: it.snippet?.channelTitle,
      thumbnail: it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url || '',
    }));

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
