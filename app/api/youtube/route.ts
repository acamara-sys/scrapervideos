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
import { configDotenv } from "dotenv";
import { NextRequest, NextResponse }
from "next/server";

const API_KEY = process.env.API_KEY;

export async function GET( req: NextRequest) {

  try {

    const keyword =
      req.nextUrl.searchParams.get("keyword" );

    const url = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );

    url.searchParams.set( "q", keyword || "" );


    url.searchParams.set("part", "snippet" );
    url.searchParams.set("type", "video");
    url.searchParams.set( "maxResults", "10" );
    url.searchParams.set( "key", API_KEY || "");

    const response = await fetch(url.toString());

    const data = await response.json();

    console.log(data)

    return NextResponse.json( data.items );

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {   error: "Erreur API" },
      {   status: 500    }
    );

  }

}