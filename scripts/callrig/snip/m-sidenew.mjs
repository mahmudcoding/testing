import { DOM } from './lib.mjs';
// QA_ROOM='SR-A' QA_INVITE='QA Alice,QA Bob' QA_PRIVATE=1 — open New Side Room, read it, optionally create.
export default async ({page}) => {
  await page.evaluate(DOM);
  const out={};
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,400);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,300),res:b});}});
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const sb = await page.$('button[aria-label="Side Rooms"]');
  if (sb && (await sb.getAttribute('aria-pressed'))!=='true') { const bb=await sb.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2200); }
  const nb = await page.$('[data-testid="side-rooms-new"]');
  out.newBtn = !!nb; if(!nb) return out;
  const nbb = await nb.boundingBox(); await page.mouse.click(nbb.x+nbb.width/2, nbb.y+nbb.height/2);
  await page.waitForTimeout(2200);
  out.dialog = await page.evaluate(()=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
      .sort((a,b)=>T(a).length-T(b).length)[0];
    if(!d) return null;
    return {text:T(d),
      controls:[...d.querySelectorAll('button,input,[role=switch],[role=checkbox],[role=radio]')].filter(vis).map(x=>({
        tag:x.tagName, l:(x.getAttribute('aria-label')||x.textContent||x.placeholder||'').replace(/\s+/g,' ').trim().slice(0,50),
        t:x.getAttribute('data-testid'), d:x.disabled||x.getAttribute('aria-disabled')==='true',
        st:x.getAttribute('aria-checked')||x.getAttribute('data-state')}))};
  });
  if (process.env.QA_ROOM) {
    const ni = await page.$('[data-testid="side-room-create-name"]') || await page.$('[role=dialog] input[type=text]');
    if (ni) { await ni.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.keyboard.type(process.env.QA_ROOM,{delay:20}); }
    if (process.env.QA_PRIVATE) {
      const pv = await page.$('[data-testid="side-room-create-private"]');
      out.privateBtn = !!pv;
      if (pv) { const pb = await pv.boundingBox(); await page.mouse.click(pb.x+pb.width/2, pb.y+pb.height/2); }
      await page.waitForTimeout(700);
    }
    for (const nm of (process.env.QA_INVITE||'').split(',').filter(Boolean)) {
      const done = await page.evaluate((nm)=>{const b=[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].find(x=>(x.textContent||'').includes(nm));
        if(!b) return false; b.click(); return true;}, nm.trim());
      out['invited_'+nm.trim()] = done; await page.waitForTimeout(400);
    }
    out.preSubmit = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].map(b=>(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,20)+'='+b.getAttribute('aria-checked')));
    const sub = await page.$('[data-testid="side-room-create-submit"]');
    out.submitDisabled = sub ? await sub.evaluate(e=>e.disabled) : null;
    if (sub && !out.submitDisabled) { const sbb=await sub.boundingBox(); await page.mouse.click(sbb.x+sbb.width/2, sbb.y+sbb.height/2); out.created=true; await page.waitForTimeout(6000); }
  }
  out.after = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return {url:location.pathname, panel:p?T(p):null,
      btns:p?[...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,45)):[]};});
  out.net=net;
  return out;
};
