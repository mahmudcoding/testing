import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const label = async () => await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||'')); return b?{l:b.getAttribute('aria-label'),d:b.disabled}:null;});
  const stage = await page.$('[data-testid="call-surface"]');
  if (stage) { const b = await stage.boundingBox(); await page.mouse.click(b.x+b.width/2, b.y+80); }
  await page.waitForTimeout(600);
  const before = await label();
  await page.keyboard.press('Meta+d');
  await page.waitForTimeout(2500);
  const after = await label();
  await page.keyboard.press('Meta+d');
  await page.waitForTimeout(2000);
  const after2 = await label();
  return {before, afterCmdD: after, afterSecondCmdD: after2};
};
