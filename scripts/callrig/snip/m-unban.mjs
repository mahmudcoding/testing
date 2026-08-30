import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,200);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),res:b});}});
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const tog = await page.$('[data-testid="call-controls-people-toggle"]');
  if (tog && (await tog.getAttribute('aria-pressed')) !== 'true') { await tog.click(); await page.waitForTimeout(1600); }
  const who = process.env.QA_WHO || 'QA Carol';
  const b = await page.$(`button[aria-label="Unban ${who}"]`);
  if (!b) return {err:'no unban button', net};
  const bb = await b.boundingBox();
  await page.mouse.click(bb.x+bb.width/2, bb.y+bb.height/2);
  await page.waitForTimeout(2500);
  const after = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const acts=[...document.querySelectorAll('button[aria-label*="Participant actions"]')].filter(vis);
    let p=null,bl=1e9;
    for(const e of document.querySelectorAll('div,aside,section')){ if(!vis(e))continue;
      const r=e.getBoundingClientRect(); if(r.width<200||r.width>620||r.height<300)continue;
      if(!acts.every(a=>e.contains(a)))continue; const t=T(e); if(t.length>bl)continue; }
    const cands=[...document.querySelectorAll('div,aside,section')].filter(e=>{if(!vis(e))return false;
      const r=e.getBoundingClientRect(); return r.width>200&&r.width<620&&r.height>300&&acts.every(a=>e.contains(a));});
    cands.sort((a,b)=>T(b).length-T(a).length);
    return cands[0]?T(cands[0]):null;});
  return {clicked:true, panelAfter: after, net};
};
