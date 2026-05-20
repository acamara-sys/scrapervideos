import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {

    const url = new URL(req.url)

    const keyword = url.searchParams.get("keyword");
    console.log(url);

    return NextResponse.json({ok: true })
}