import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out = {};
  const b = page.locator('[data-testid="call-controls-add-to-call"]').first();
  if (!(await b.count())) return {err:'no add-to-call'};
  await b.click(); await page.waitForTimeout(2500);
  out.dialog = await page.evaluate((v) => {
    const vis = eval(v);
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if (!d) return {err:'no dialog'};
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,500),
      inter:[...d.querySelectorAll('button,input,[role="option"],[role="checkbox"],li')].filter(vis)
        .map(x=>({tag:x.tagName.toLowerCase(), l:(x.getAttribute('aria-label')||x.innerText||x.placeholder||'').trim().replace(/\s+/g,' ').slice(0,40), t:x.getAttribute('data-testid')}))
        .filter(x=>x.l||x.t).slice(0,30)};
  }, VIS);
  return out;
}
