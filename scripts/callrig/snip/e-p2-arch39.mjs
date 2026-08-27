import {WS, BASE} from './e-p2-helpers.mjs';
async function clean(page, chanId, label, term){
  await page.goto(`${BASE}/w/${WS}/c/${chanId}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const arch = await page.evaluate(()=>/This channel is archived/.test(document.body.innerText));
  const net=[]; const h=async r=>{const u=r.url(); if(/\/api\/v1\/search\?/.test(u)) net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||''), scoped:/channel_ids=/.test(u)});};
  page.on('response',h);
  await page.locator('button[aria-label="Search in channel"]').click();
  await page.waitForTimeout(2500);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(term,{delay:55});
  await page.waitForTimeout(7000);          // NO chip removal this time
  page.off('response',h);
  const ui=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {tabs:(t.match(/All ?\d* Messages ?\d*/)||[''])[0], hasNumbers:/All \d+/.test(t),
      noResults:/No results/.test(t),
      chip:[...d.querySelectorAll('button')].filter(vis).map(e=>e.getAttribute('aria-label')||'').filter(x=>/^Remove in/.test(x))};
  });
  return {label, archivedBanner:arch, requests:net, ui};
}
export default async ({page}) => ({
  seededArchived: await clean(page,'C4QEARCHIVE0001','qa-archived (seeded, archived)','probe'),
  appArchived:    await clean(page,'C4OX3463S8ECN8X','app-created archived','probe'),
  liveControl:    await clean(page,'C4QEGENERAL0001','qa-general (live)','probe'),
});
