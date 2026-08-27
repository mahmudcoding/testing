import {WS, BASE} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const reqs=[];
  page.on('request', r => { const u=r.url(); if (u.includes('/api/v1/search')) reqs.push(u.replace(/^https?:\/\/[^/]+/,'')); });
  await page.goto(`${BASE}/w/${WS}/c/${GEN}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.keyboard.press('Meta+k');
  await page.waitForTimeout(1200);
  await page.keyboard.type('zarqonverif', {delay:60});
  await page.waitForTimeout(3000);

  const dialog = await page.evaluate(() => {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('zarqonverif');
    return { snippet: t.slice(Math.max(0,i-260), i+260),
      hasOpenFull: [...document.querySelectorAll('button,a')].some(e=>/open full search/i.test(e.textContent||'')) };
  });
  const before = reqs.slice();

  const btn = page.locator('button, a').filter({hasText:/Open full search/i}).first();
  const n = await btn.count();
  if (n) await btn.click();
  await page.waitForTimeout(4000);

  const after = await page.evaluate(() => {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const btns=[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean);
    return { url: location.pathname+location.search,
      noResults: /No results/i.test(t),
      subtitle: (t.match(/Search messages[^.]*\./)||[''])[0],
      removeFilterBtn: btns.filter(b=>/remove|filter|in #/i.test(b)).slice(0,8),
      text: t.slice(0, 300) };
  });
  return { dialog, clickedOpenFull: n>0, searchRequests: reqs.map(u=>u.slice(0,190)), after };
};
