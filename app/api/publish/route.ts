import { clonePageVaryPathWithNewSearchParams } from "next/dist/client/components/segment-cache/vary-path";
import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";


export async function POST(req: Request) {
       
        
        const body = await req.json();
633
        const context = await chromium.launchPersistentContext(
            "./chrome-profile",
            {
            headless: false
            }
        );

        const page = await context.newPage();

        console.log(body)

        await page.goto(
        "https://skoleom.shop/wp-admin/post-new.php?post_type=video"
        );

            // CSS Selectors

            // Fill title, profile, duration, videoId with body.info
            const titre  = await page.locator('id=title').fill(body.title);
            const url  = await page.locator('id=acf-field_687936b2b0e88')
            .fill(`https://www.youtube.com/watch?v=${body.videoId}`);
            const videoId = await page.locator('id=acf-field_687936e0b0e89').fill(body.videoId);
            const duration = await page.locator("id=acf-field_68f92eb225504").fill(body.duration);
            const thumble  = await page.locator("id=acf-field_68793708b0e8a").fill(body.miniature);

            // Check Boxs
            const sesport_box = await page.locator("id=in-popular-collection-1443").click();
            const football_box = await page.locator("id=in-popular-genre_video-1480").click();

            const inputProfile = await page.locator("#acf-field_68fb31a423302 input[type=text]").fill(body.profile)
            const firstChoice = await page.locator('#acf-field_68fb31a423302 .choices-list li').first();

            await firstChoice.waitFor({ state: 'visible' });

            await firstChoice.click();

    return Response.json({
        success: true
    });

}