import { DOM } from './lib.mjs';
// QA_PICK='QA Carol' — from inside a side room, use the room's "Add people" control.
export default async ({page}) => {
  await page.evaluate(DOM);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,300);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,200),res:b});}});
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const sb = await page.$('button[aria-label="Side Rooms"]');
  if (sb && (await sb.getAttribute('aria-pressed'))!=='true') { const bb=await sb.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2200); }
  const ap = await page.evaluateHandle((room)=>{
      const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
      const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
      const N=(e)=>(e.getAttribute('aria-label')||T(e)||'').trim();
      const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0]; if(!p) return null;
      const all=[...p.querySelectorAll('[data-testid="side-room-add-people"]')].filter(vis);
      if(!room) return all[0]||null;
      let best=null,bl=1e9;
      for(const e of p.querySelectorAll('*')){const t=T(e); if(!t.includes(room))continue;
        const j=all.find(b=>e.contains(b)); if(!j)continue;
        if(t.length<bl){bl=t.length;best=j;}}
      return best;}, process.env.QA_ROOM||'').then(h=>h.asElement());
  const out={addFound:!!ap};
  if(!ap) return out;
  const b=await ap.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
  await page.waitForTimeout(2000);
  out.dialog = await page.evaluate(()=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
      .sort((a,b)=>T(a).length-T(b).length)[0];
    if(!d) return null;
    return {text:T(d), controls:[...d.querySelectorAll('button,input')].filter(vis).map(x=>({
      l:(x.getAttribute('aria-label')||x.textContent||x.placeholder||'').replace(/\s+/g,' ').trim().slice(0,45),
      t:x.getAttribute('data-testid'), st:x.getAttribute('aria-checked'), d:x.disabled}))};});
  if (process.env.QA_PICK) {
    const done = await page.evaluate((nm)=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
        .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
      const b=[...d.querySelectorAll('button')].filter(vis).find(x=>(x.textContent||'').includes(nm));
      if(!b) return false; b.click(); return true;}, process.env.QA_PICK);
    out.picked = done; await page.waitForTimeout(700);
    out.preSubmit = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
        .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
      return [...d.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').replace(/\s+/g,' ').trim().slice(0,30)+'='+x.getAttribute('aria-checked'));});
    const sub = await page.evaluateHandle(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
        .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
      return [...d.querySelectorAll('button')].filter(vis).find(x=>/^(Add|Invite|Send|Move)/.test((x.textContent||'').trim()))||null;});
    const se = sub.asElement(); out.submitFound=!!se;
    if (se) { out.submitLabel = await se.evaluate(e=>e.textContent.trim()); out.submitDisabled = await se.evaluate(e=>e.disabled);
      if (!out.submitDisabled) { const sbb=await se.boundingBox(); out.submitEpoch=Date.now(); await page.mouse.click(sbb.x+sbb.width/2,sbb.y+sbb.height/2); await page.waitForTimeout(4000);} }
  }
  out.after = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return p?(p.innerText||'').replace(/\s+/g,' ').trim():null;});
  out.net=net;
  return out;
};
