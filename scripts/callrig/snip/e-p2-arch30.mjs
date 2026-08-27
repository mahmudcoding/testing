import {WS, BASE} from './e-p2-helpers.mjs';
async function probe(page, chanId, label, term){
  await page.goto(`${BASE}/w/${WS}/c/${chanId}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const net=[]; const h = async r => { const u=r.url(); if(/\/api\/v1\/search\?/.test(u)) net.push(decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'')); };
  page.on('response',h);
  await page.locator('button[aria-label="Search in channel"]').click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(term,{delay:60});
  await page.waitForTimeout(5000);
  // boundary: remove the channel chip, does the search then run?
  const removed = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const btn=[...d.querySelectorAll('button')].filter(vis)
      .find(e=>/remove|clear|×|✕/i.test((e.getAttribute('aria-label')||'')+' '+(e.textContent||'')));
    if(btn){btn.click(); return (btn.getAttribute('aria-label')||btn.textContent||'').trim().slice(0,40);}
    return null;
  });
  await page.waitForTimeout(3500);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {hasNumbers:/All \d+/.test(t), noResults:/No results/.test(t),
            chip:/in #/.test(t), tabs:(t.match(/All ?\d* Messages ?\d*/)||[''])[0]};
  });
  return {label, term, searchRequests:net, chipRemoveControl:removed, ui};
}
export default async ({page}) => ({
  run1: await probe(page,'C4OX3463S8ECN8X','archived (app-created), repeat','archive'),
  run2: await probe(page,'C4QEARCHIVE0001','archived (seeded), second archived channel','probe'),
  run3: await probe(page,'C4QEPRIVATE0001','qa-private (live control #2)','probe'),
});
