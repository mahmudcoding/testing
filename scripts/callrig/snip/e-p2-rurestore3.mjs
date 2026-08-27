import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main [aria-label="Язык"], main [aria-label="Language"]').first().click();
  await page.waitForTimeout(2500);
  await page.locator('[role=dialog] button').filter({hasText:/^(Английский|English)$/}).first().click();
  await page.waitForTimeout(6000);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const c=[...m.querySelectorAll('button')].filter(vis)
      .find(e=>/Language|Язык/i.test(e.getAttribute('aria-label')||''));
    return {label:c?c.getAttribute('aria-label'):null, value:c?(c.textContent||'').trim():null,
      head:m.innerText.replace(/\s+/g,' ').slice(0,80),
      restored: !!c && c.getAttribute('aria-label')==='Language' && /English/i.test(c.textContent||'')};
  });
};
