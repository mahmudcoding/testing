import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const caught=[];
  const h = async r => { const u=r.url(); if(!/\/api\/v1\/search\?/.test(u)) return;
    let b=null; try{b=await r.json()}catch{}
    caught.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||''),
      total_channels:b?.total_channels, total_users:b?.total_users,
      total_messages:b?.total_messages, total_files:b?.total_files,
      channels:(b?.channels||[]).map(c=>c.name), users:(b?.users||[]).map(x=>x.username||x.display_name)}); };
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2500);
  const inp = page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  for (const q of ['general','Alice','QA Alice','private','Bob','arch']) {
    await inp.fill(''); await page.waitForTimeout(400);
    await inp.type(q, {delay:40}); await page.waitForTimeout(3200);
  }
  page.off('response',h);
  const byQ={}; for(const c of caught) byQ[c.q]=c;
  return Object.values(byQ).filter(c=>c.q);
};
