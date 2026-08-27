import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const current = await page.evaluate(()=>{
    const e=[...document.querySelectorAll('[aria-label="Language"],[aria-label="Язык"]')][0];
    return e? (e.textContent||'').trim() : '(control not found)';
  });
  if (/English/i.test(current)) return {alreadyEnglish:true, current};
  await page.locator('main [aria-label="Language"],main [aria-label="Язык"]').first().click();
  await page.waitForTimeout(2200);
  await page.locator('[role=dialog] button').filter({hasText:/^English$/}).first().click();
  await page.waitForTimeout(5500);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>{
    const e=[...document.querySelectorAll('[aria-label="Language"],[aria-label="Язык"]')][0];
    const m=document.querySelector('main');
    return {lang: e? (e.textContent||'').trim() : '?',
      headings:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,90)};
  });
  return {wasBefore:current, after, restored:/English/i.test(after.lang)};
};
