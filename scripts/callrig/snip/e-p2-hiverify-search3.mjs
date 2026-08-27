import {WS, BASE} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const reqs=[];
  page.on('request', r => { const u=r.url(); if (u.includes('/api/v1/search')) reqs.push(u.replace(/^https?:\/\/[^/]+/,'')); });
  await page.goto(`${BASE}/w/${WS}/c/${GEN}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);

  const sb = page.locator('button[aria-label="Search"], button:has-text("Search")').first();
  const opened = await sb.count();
  if (opened) await sb.click();
  await page.waitForTimeout(1500);
  await page.keyboard.type('zarqonverif', {delay:60});
  await page.waitForTimeout(3500);

  const dialog = await page.evaluate(() => {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('zarqonverif');
    const btns=[...document.querySelectorAll('button,a')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean);
    return { around: i>=0 ? t.slice(Math.max(0,i-200), i+240) : '(token not on screen)',
             openFull: btns.filter(b=>/open full search/i.test(b)),
             removeChip: btns.filter(b=>/remove .*filter/i.test(b)) };
  });
  const dialogReqs = reqs.slice();

  const btn = page.locator('button, a').filter({hasText:/Open full search/i}).first();
  const n = await btn.count();
  if (n) await btn.click();
  await page.waitForTimeout(4500);

  const after = await page.evaluate(() => {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const btns=[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean);
    return { url: location.pathname+location.search,
      noResults: /No results/i.test(t),
      subtitle: (t.match(/Search messages[^.]*\./)||[''])[0],
      removeFilterBtn: btns.filter(b=>/remove|in #/i.test(b)).slice(0,8),
      tokenVisible: t.includes('zarqonverif'),
      head: t.slice(0,240) };
  });
  return { sidebarSearchFound: opened>0, dialog, dialogReqs: dialogReqs.map(u=>u.slice(0,200)),
           clickedOpenFull: n>0, allReqs: reqs.map(u=>u.slice(0,200)), after };
};
