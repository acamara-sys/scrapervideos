import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";


export async function POST(req: Request) {

    const body = await req.json();

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(
        "https://skoleom.shop/wp-admin/post-new.php?post_type=video"
    );

    const cookies = await page.cookies();
 

    return Response.json({
        success: true
    });
}