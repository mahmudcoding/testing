import {WS, BASE} from './e-p2-helpers.mjs';
async function q(page, text){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const net=[]; const h=async r=>{const u=r.url(); if(!/\/api\/v1\/search\?/.test(u))return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      chan:/channel_ids=/.test(u), dm:/dm_ids=/.test(u), tm:b?.total_messages, status:r.status()});};
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(text,{delay:45});
  await page.waitForTimeout(5000);
  page.off('response',h);
  const ui=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {chips:[...d.querySelectorAll('button')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||'')).filter(x=>/^Remove /.test(x)),
      inputValue:(d.querySelector('input')||{}).value,
      counts:(t.match(/All ?\d* Messages ?\d*/)||[''])[0],
      suggestions:[...d.querySelectorAll('[role=option]')].filter(vis).length,
      noResults:/No results/.test(t)};
  });
  return {typed:text, ...ui, lastReq:net[net.length-1]||null, reqCount:net.length};
}
export default async ({page}) => ({
  ghostPerson: await q(page,':@ Zzznobody probe'),
  bareAt:      await q(page,':@ '),
  bareIn:      await q(page,':in '),
  ghostChan:   await q(page,':in #zzz-no-such probe'),
});
