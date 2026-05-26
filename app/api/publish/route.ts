import { NextResponse } from "next/server";
import { chromium } from "playwright";

export async function POST(req: Request) {
  const body = await req.json();

  const context = await chromium.launchPersistentContext("./chrome-profile", {
    headless: false,
  });

  try {
    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();

    await page.goto("https://shop.skoleom.com/wp-admin/post-new.php?post_type=video");

    await page.locator('id=title').fill(body.title ?? ''); // Title 
    await page.locator('id=acf-field_687936b2b0e88').fill(`https://www.youtube.com/watch?v=${body.videoId}`); // Lien youtube 
    await page.locator('id=acf-field_687936e0b0e89').fill(body.videoId ?? ''); // Video ID
    await page.locator('id=acf-field_68f92eb225504').fill(body.duration ?? ''); // Durée de la vidéo
    await page.locator('id=acf-field_68793708b0e8a').fill(body.miniature ?? ''); // Miniature

    if (body.collection_sesport !== false) {
      await page.locator('id=in-popular-collection-1443').click();
    }
    if (body.genre_football !== false) {
      await page.locator('id=in-popular-genre_video-1480').click();
    }

    if (body.profile) {
      const input = page.locator('#acf-field_68fb31a423302 input[type=text]');
      await input.click();
      await input.pressSequentially(body.profile, { delay: 80 });

      // Attendre que le résultat apparaisse dans la liste de gauche
      const result = page.locator('#acf-field_68fb31a423302 .choices li').filter({ hasText: body.profile });
      await result.waitFor({ state: 'visible', timeout: 6000 });
      await result.first().click();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
