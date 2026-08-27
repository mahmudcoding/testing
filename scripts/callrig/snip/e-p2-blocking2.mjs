import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CAROL='U4QECAROL000001';
export default async ({page}) => {
  const out={};
  // smallest element containing BOTH the name and a Call button
  const rowState = `(() => { ${VISFN}
     const m=document.querySelector('main');
     const cands=[...m.querySelectorAll('*')].filter(e=>{
        const t=(e.textContent||'');
        return /QA Carol/.test(t) && [...e.querySelectorAll('button')].some(b=>/^Call$/.test((b.textContent||'').trim()));
     });
     if(!cands.length) return {none:true,
        anyCallButtons:[...m.querySelectorAll('button')].filter(vis).filter(b=>/^Call$/.test((b.textContent||'').trim())).length};
     cands.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
     const r=cands[0];
     return { rowText:(r.innerText||'').replace(/\\s+/g,' ').trim().slice(0,60),
              controls:[...r.querySelectorAll('button')].filter(vis)
                .map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,20))
                      +'/disabled='+b.disabled+'/aria='+(b.getAttribute('aria-disabled')||'-')) }; })()`;
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.before = await page.evaluate(rowState);
  await page.evaluate(`(async () => { await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
     headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:'${CAROL}'})}); })()`);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8500);
  out.whileBlocked = await page.evaluate(rowState);
  // does the block actually register?
  out.blockState = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
     const t=await r.text(); return {st:r.status, hasCarol:/CAROL/i.test(t), body:t.slice(0,140)}; })()`);
  await page.evaluate(`(async () => { await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
     headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:'${CAROL}'})}); })()`);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  out.afterUnblock = await page.evaluate(rowState);
  return out;
};
