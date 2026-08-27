import {WS, BASE} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const reqs=[];
  page.on('request', r => { const u=r.url(); if (u.includes('/api/v1/search')) reqs.push(u.replace(/^https?:\/\/[^/]+/,'')); });
  await page.goto(`${BASE}/w/${WS}/c/${GEN}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search"], button:has-text("Search")').first().click();
  await page.waitForTimeout(1200);
  await page.keyboard.type('qa', {delay:60});
  await page.waitForTimeout(3000);
  const baseline = reqs.slice();

  const out=[];
  for (const label of ['Last 7 days','Last 30 days','All time']) {
    const before = reqs.length;
    const el = page.locator('button').filter({hasText: new RegExp('^'+label+'$','i')}).first();
    const n = await el.count();
    let pressed=null, cls=null;
    if (n) {
      await el.click();
      await page.waitForTimeout(2500);
      pressed = await el.getAttribute('aria-pressed');
      cls = (await el.getAttribute('class')||'').slice(0,70);
    }
    out.push({ chip: label, found: n>0, aria_pressed: pressed, classHint: cls,
               newRequests: reqs.slice(before).map(u=>u.slice(0,200)) });
  }
  const counts = await page.evaluate(()=> {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return (t.match(/All \d+ Messages \d+ Channels \d+ People \d+ Files \d+/)||[''])[0];
  });
  return { baselineRequests: baseline.map(u=>u.slice(0,200)), chips: out, finalCounts: counts };
};
