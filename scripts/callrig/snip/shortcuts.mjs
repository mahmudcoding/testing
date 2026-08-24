import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const lbl = async () => await page.evaluate(() => {
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    const pick = p => { const b=[...tb.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').startsWith(p)); return b? b.getAttribute('aria-label') : null; };
    return {mic: pick('Mute')||pick('Unmute'), cam: pick('Turn camera')};
  });
  const surface = page.locator('[data-testid="call-surface"], [data-testid="call-overlay-expanded"]').first();
  await surface.click({position:{x:20,y:200}}).catch(()=>{});
  await page.waitForTimeout(600);
  const out = {start: await lbl()};
  await page.keyboard.press('Meta+d'); await page.waitForTimeout(1500); out.afterMetaD = await lbl();
  await page.keyboard.press('Meta+d'); await page.waitForTimeout(1500); out.afterMetaD2 = await lbl();
  await page.keyboard.press('Meta+e'); await page.waitForTimeout(2000); out.afterMetaE = await lbl();
  await page.keyboard.press('Meta+e'); await page.waitForTimeout(2000); out.afterMetaE2 = await lbl();
  // control-based variants
  await page.keyboard.press('Control+d'); await page.waitForTimeout(1200); out.afterCtrlD = await lbl();
  await page.keyboard.press('Control+d'); await page.waitForTimeout(1200); out.afterCtrlD2 = await lbl();
  const titles = await page.evaluate(() => {
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    return [...tb.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||'').slice(0,24)} :: ${b.getAttribute('title')||''}`).filter(x=>x.includes('⌘')||x.includes('Ctrl'));
  });
  return {...out, titlesWithShortcut: titles, platform: await page.evaluate(()=>navigator.platform)};
};
