import {WS, BASE} from './e-p2-helpers.mjs';
async function run(page, chanId, label, term){
  await page.goto(`${BASE}/w/${WS}/c/${chanId}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const net=[]; const h = async r => { const u=r.url(); if(!/\/api\/v1\/search\?/.test(u)) return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      chanIds:(u.match(/channel_ids=([^&]*)/)||[])[1]?'present':'absent',
      tm:b?.total_messages}); };
  page.on('response',h);
  await page.locator('button[aria-label="Search in channel"]').click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(term,{delay:60});
  await page.waitForTimeout(5000);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {tabs:(t.match(/All ?\d* Messages ?\d* Channels ?\d* People ?\d* Files ?\d*/)||[''])[0],
      hasNumbers:/All \d+/.test(t), noResults:/No results/.test(t),
      rows:[...d.querySelectorAll('button,a')].filter(vis).map(e=>(e.getAttribute('aria-label')||'').trim()).filter(x=>/^Message:/.test(x)).length};
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  return {label, requests:net, ui};
}
export default async ({page}) => {
  const control = await run(page,'C4QEGENERAL0001','qa-general (live, control)','probe');
  const archived = await run(page,'C4OX3463S8ECN8X','archived channel','archive');
  const archived2= await run(page,'C4OX3463S8ECN8X','archived channel, term from control','probe');
  return {control, archived, archived2};
};
