import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CARD = `(() => { ${VISFN}
   const d=[...document.querySelectorAll('[role=dialog],[class*=popover],[class*=Popover]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
   if(!d) return {open:false};
   const btns=[...d.querySelectorAll('button')].filter(vis)
     .map(b=>((b.textContent||'').trim().replace(/\\s+/g,' ')||b.getAttribute('aria-label')||'?')
             +(b.disabled?'[disabled]':''));
   const t=(d.innerText||'').replace(/\\s+/g,' ');
   return {open:true, btns:btns.slice(0,8), cannot:/cannot be blocked/i.test(t),
           hasUnblock:/Unblock/i.test(t)}; })()`;
const SNAP = `(() => { ${VISFN}
   const dlg=[...document.querySelectorAll('[role=dialog],[role=alertdialog],[class*=popover],[class*=Popover]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>100;}).length;
   const toasts=[...document.querySelectorAll('[role=status],[role=alert],[class*=toast],[class*=Toast],[class*=notification]')]
     .filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').slice(0,40)).filter(Boolean);
   return {nDlg:dlg, toasts}; })()`;
const openBob = async page => {
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
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
  await openBob(page);
  out.cardWhileUnblocked = await page.evaluate(CARD);   // positive control
  const bb = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],[class*=popover],[class*=Popover]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Block$/.test((x.textContent||'').trim()));
     if(!b||b.disabled) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.blockClickable = !!bb;
  if(bb){
    const frames=[{t:'pre', ...(await page.evaluate(SNAP))}];
    await page.mouse.move(bb.cx,bb.cy); await page.waitForTimeout(500);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    for(let i=0;i<16;i++){ await page.waitForTimeout(300); frames.push({t:(i+1)*300, ...(await page.evaluate(SNAP))}); }
    out.ALK3533 = {nFrames:frames.length, anyToast:frames.some(f=>f.toasts.length>0),
      maxDlg:Math.max(...frames.map(f=>f.nDlg)),
      dlgTrace:frames.map(f=>f.nDlg).join(','),
      firstFrameAfterClick:frames[1]};
  }
  out.blockedNow = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
     const j=await r.json(); return {total:j.total, users:(j.users||[]).map(u=>u.name)};})()`);
  await openBob(page);
  out.cardWhileBlocked = await page.evaluate(CARD);
  // ALWAYS restore
  out.restore = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/users/unblock',
     {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({user_id:'U4QEBOB00000001'})});
     const j=await r.json().catch(()=>({}));
     await new Promise(z=>setTimeout(z,1200));
     const c=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
     const cj=await c.json(); return {st:r.status, ok:JSON.stringify(j).slice(0,40), nowTotal:cj.total};})()`);
  return out;
};
