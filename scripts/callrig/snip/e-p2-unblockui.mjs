import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, cx, cy) => { await page.mouse.move(cx,cy); await page.waitForTimeout(250);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); };
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/privacy', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // block bob via API so the UI has something to unblock
  out.setup = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/users/block',
     {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({user_id:'U4QEBOB00000001'})});
     const j=await r.json().catch(()=>({}));
     const c=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
     const cj=await c.json(); return {st:r.status, total:cj.total};})()`);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000);
  await page.evaluate(`(() => { const el=[...document.querySelectorAll('*')].find(e=>{
       const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
       return /^\\s*Blocked users\\s*$/.test(own); }); if(el) el.scrollIntoView({block:'start'}); })()`);
  await page.waitForTimeout(2000);
  const scan = `(() => { ${VISFN}
     const hd=[...document.querySelectorAll('*')].find(e=>{
       const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
       return /^\\s*Blocked users\\s*$/.test(own); });
     const hy=hd?hd.getBoundingClientRect().y:0;
     const m=document.querySelector('main');
     const near=[...m.querySelectorAll('button,input,[role=combobox]')]
       .map(e=>{const b=e.getBoundingClientRect();
         return {tag:e.tagName, tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22),
                 al:(e.getAttribute('aria-label')||'').slice(0,22), dis:e.disabled===true,
                 vis:vis(e)?1:0, y:Math.round(b.y), cx:Math.round(b.x+b.width/2), cy:Math.round(b.y+b.height/2)};})
       .filter(e=>e.y>=hy-20 && e.y<=hy+300).sort((a,b)=>a.y-b.y);
     const txt=(m.innerText||'').replace(/\\s+/g,' ');
     const i=txt.indexOf('Blocked users');
     return {section:txt.slice(i, i+220), controls:near.slice(0,8)}; })()`;
  out.whileBlocked = await page.evaluate(scan);
  const un = (out.whileBlocked.controls||[]).find(c=>/Unblock/i.test(c.tx+' '+c.al));
  out.unblockControl = un || null;
  if(un){ await mc(page, un.cx, un.cy); await page.waitForTimeout(4500);
    out.afterClick = await page.evaluate(scan); }
  out.finalState = await page.evaluate(`(async()=>{
     const c=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
     const cj=await c.json(); return {total:cj.total, users:(cj.users||[]).map(u=>u.name)};})()`);
  // guarantee restore
  if(out.finalState.total>0){
    out.forcedRestore = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/users/unblock',
       {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({user_id:'U4QEBOB00000001'})});
       await new Promise(z=>setTimeout(z,1200));
       const c=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
       const cj=await c.json(); return {st:r.status, nowTotal:cj.total};})()`);
  }
  return out;
};
