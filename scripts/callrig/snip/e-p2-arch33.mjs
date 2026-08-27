import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const net=[]; const h=async r=>{const u=r.url(); if(!/\/api\/v1\/search\?/.test(u))return; let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      tu:b?.total_users, users:(b?.users||[]).map(x=>x.username||x.display_name||x.id).slice(0,5),
      tc:b?.total_channels, chans:(b?.channels||[]).map(c=>c.name)});};
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  // broad queries that would match almost any indexed user document
  for(const q of ['qa_','alice','bob','user','test','admin','owner']){
    await inp.fill(''); await page.waitForTimeout(400);
    await inp.type(q,{delay:35}); await page.waitForTimeout(2600);
  }
  page.off('response',h);
  const byQ={}; for(const c of net) if(c.q) byQ[c.q]=c;
  const rows=Object.values(byQ);
  return {rows, anyUserEverReturned: rows.some(r=>(r.tu||0)>0),
          anyChannelEverReturned: rows.some(r=>(r.tc||0)>0)};
};
