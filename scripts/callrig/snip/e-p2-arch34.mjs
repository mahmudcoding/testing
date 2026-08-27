import {WS, BASE} from './e-p2-helpers.mjs';
async function typed(page, text, label){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const net=[]; const h=async r=>{const u=r.url(); if(!/\/api\/v1\/search\?/.test(u))return; let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      scoped:/channel_ids=/.test(u), tm:b?.total_messages});};
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(text,{delay:45});
  await page.waitForTimeout(6000);
  page.off('response',h);
  const ui=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {tabs:(t.match(/All ?\d* Messages ?\d*/)||[''])[0], hasNumbers:/All \d+/.test(t),
      noResults:/No results/.test(t),
      chip:[...d.querySelectorAll('button')].filter(vis).map(e=>e.getAttribute('aria-label')||'').filter(x=>/^Remove /.test(x))};
  });
  return {label, typed:text, requests:net, ui};
}
export default async ({page}) => ({
  archivedTyped: await typed(page,':in #e-arch-probe-2353 archive','typed :in <archived channel>'),
  liveTyped:     await typed(page,':in #qa-general probe','typed :in <live channel>  [control]'),
});
