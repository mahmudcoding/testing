import {WS, BASE} from './e-p2-helpers.mjs';
const snap = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  return {url:location.pathname,
    channels:[...document.querySelectorAll('a')].filter(vis)
      .filter(a=>/\/c\//.test(a.getAttribute('href')||''))
      .map(a=>(a.textContent||'').replace(/\s+/g,' ').trim().slice(0,20)),
    dms:[...document.querySelectorAll('a')].filter(vis)
      .filter(a=>/\/d\//.test(a.getAttribute('href')||'')).length,
    heading:(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,60)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(snap);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2200);
  // REAL click via locator
  const item = page.locator('button', {hasText:/Switch to /}).first();
  const label = await item.textContent();
  await item.click();
  await page.waitForTimeout(6000);
  const after = await page.evaluate(snap);
  // switch back the same way
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2200);

  return {before, clicked:(label||'').trim(), after, urlChanged: after.url!==before.url};
};
