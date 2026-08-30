import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,200);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,150),res:b});}});
  const before = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||''));
    return b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed'),d:b.disabled||b.getAttribute('aria-disabled')==='true'}:null;});
  const btn = await page.$('button[aria-label="Unmute"], button[aria-label="Mute"]');
  let clicked=false;
  if (btn) { const bb=await btn.boundingBox(); await page.mouse.click(bb.x+bb.width/2, bb.y+bb.height/2); clicked=true; }
  // sample for 12s
  const samples=[]; const t0=Date.now();
  while(Date.now()-t0<12000){
    samples.push(await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||''));
      const notices=[...document.querySelectorAll('*')].filter(e=>!e.children.length).map(e=>(e.textContent||'').trim()).filter(t=>/mic|microphone|host|not allowed|blocked|permission/i.test(t)&&t.length<120);
      return {l:b?b.getAttribute('aria-label'):null, p:b?b.getAttribute('aria-pressed'):null, d:b?(b.disabled||b.getAttribute('aria-disabled')==='true'):null, notices:[...new Set(notices)]};}));
    await page.waitForTimeout(400);
  }
  const trans=[];let prev=null;
  for(const s of samples){const k=JSON.stringify(s); if(k!==prev){trans.push(s);prev=k;}}
  return {before, clicked, transitions: trans, net};
};
