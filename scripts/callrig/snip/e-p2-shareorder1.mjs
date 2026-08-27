import {WS, BASE} from './e-p2-helpers.mjs';
const sidebarOrder = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const side=document.querySelector('aside')||document.querySelector('nav');
  const links=[...side.querySelectorAll('a')].filter(vis)
    .map(e=>({t:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,24),
              href:(e.getAttribute('href')||''), y:Math.round(e.getBoundingClientRect().y)}))
    .filter(o=>/\/d\//.test(o.href));
  return links.sort((a,b)=>a.y-b.y).map((o,i)=>({pos:i, name:o.t, dm:o.href.split('/d/')[1]}));
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const before = await page.evaluate(sidebarOrder);
  if (before.length < 2) return {before, note:'need at least two DMs'};
  const targetName = before[before.length-1].name;   // the LAST DM in the list
  // share a file into that DM
  const t = page.locator('button:has-text("normal.txt")').first();
  await t.scrollIntoViewIfNeeded(); await t.click({button:'right'});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const it=[...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
      .find(e=>/^Share/i.test((e.textContent||'').trim()));
    it && it.click();
  });
  await page.waitForTimeout(2500);
  const picked = await page.evaluate((nm)=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const o=[...d.querySelectorAll('button,[role=option],li')].filter(vis)
      .find(e=>e.textContent.includes(nm) && /Direct message/i.test(e.textContent||''));
    if(!o) return null; o.click(); return (o.textContent||'').replace(/\s+/g,' ').slice(0,40);
  }, targetName);
  await page.waitForTimeout(1200);
  let sent=null;
  if (picked) {
    const btn = page.locator('[role=dialog] button').filter({hasText:/^Send$/}).last();
    if (await btn.count()) { await btn.click(); sent=true; await page.waitForTimeout(4000); }
  }
  const after = await page.evaluate(sidebarOrder);
  return {targetName, picked, sent, before, after,
    movedToTop: after.length && after[0].name===targetName};
};
