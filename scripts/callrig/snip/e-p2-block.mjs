import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CARD = `(() => { ${VISFN}
   const d=[...document.querySelectorAll('[role=dialog],[class*=popover],[class*=Popover]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
   if(!d) return {open:false};
   const btns=[...d.querySelectorAll('button')].filter(vis).map(b=>({
     tx:(b.textContent||'').trim().replace(/\\s+/g,' ').slice(0,20),
     al:(b.getAttribute('aria-label')||'').slice(0,20),
     dis:b.disabled, ad:b.getAttribute('aria-disabled')}));
   const t=(d.innerText||'').replace(/\\s+/g,' ');
   return {open:true, btns, cannotMsg:/cannot be blocked/i.test(t)?
     (t.match(/This user cannot be blocked[^.]*\\./)||[''])[0]:null, head:t.slice(0,60)}; })()`;
const SNAP = `(() => { ${VISFN}
   const dlg=[...document.querySelectorAll('[role=dialog],[role=alertdialog],[class*=popover],[class*=Popover]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>100;}).length;
   const toasts=[...document.querySelectorAll('[role=status],[role=alert],[class*=toast],[class*=Toast]')]
     .filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').slice(0,40)).filter(Boolean);
   return {nDlg:dlg, toasts}; })()`;
const openBob = async page => {
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const r = await page.evaluate(`(() => { ${VISFN}
     const rows=[...document.querySelectorAll('main *')].filter(vis)
       .filter(e=>{const t=(e.innerText||'').replace(/\\s+/g,' ').trim();
                   return /^QA Bob\\b/.test(t) && t.length<60 && e.getBoundingClientRect().height<90;});
     if(!rows.length) return null; const el=rows[rows.length-1]; const b=el.getBoundingClientRect();
     return {cx:Math.round(b.x+b.width/2), cy:Math.round(b.y+b.height/2)}; })()`);
  if(!r) return false;
  await page.mouse.move(r.cx,r.cy); await page.waitForTimeout(250);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(3000); return true;
};
export default async ({page}) => {
  const out={};
  out.blockedBefore = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
     const j=await r.json(); return {st:r.status, total:j.total, n:(j.users||[]).length};})()`).catch(e=>({err:1}));
  out.opened = await openBob(page);
  out.cardBefore = await page.evaluate(CARD);
  const bb = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],[class*=popover],[class*=Popover]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Block$/.test((x.textContent||'').trim()));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.blockBtn = bb;
  if(bb){
    const frames=[{t:'pre', ...(await page.evaluate(SNAP))}];
    await page.mouse.move(bb.cx,bb.cy); await page.waitForTimeout(500);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    for(let i=0;i<16;i++){ await page.waitForTimeout(300); frames.push({t:(i+1)*300, ...(await page.evaluate(SNAP))}); }
    const key=f=>JSON.stringify([f.nDlg,f.toasts]);
    const kept=[]; let last=null;
    for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
    out.ALK3533={frames:frames.length, anyToast:frames.some(f=>f.toasts.length), changes:kept};
  }
  out.blockedAfter = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
     const j=await r.json(); return {st:r.status, total:j.total, n:(j.users||[]).length};})()`);
  // reopen the card
  await openBob(page);
  out.ALK3532_sameSession = await page.evaluate(CARD);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  await openBob(page);
  out.ALK3532_afterReload = await page.evaluate(CARD);
  return out;
};
