import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CAROL='U4QECAROL000001';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const listState = `(() => { ${VISFN}
     const m=document.querySelector('main');
     const rows=[...m.querySelectorAll('div,li')].filter(e=>vis(e)&&/^QA /.test((e.textContent||'').trim())&&(e.textContent||'').length<80);
     const inner=rows.filter(r=>!rows.some(o=>o!==r&&r.contains(o)));
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const order=[...t.matchAll(/QA (Admin|Alice|Bob|Carol|Dave|Guest|Owner)/g)].map(x=>x[1]);
     // controls on Carol's row
     const carolRow=inner.find(r=>/QA Carol/.test(r.textContent||''));
     return {order:[...new Set(order)],
             carolRowText: carolRow? (carolRow.innerText||'').replace(/\\s+/g,' ').trim().slice(0,60):null,
             carolControls: carolRow? [...carolRow.querySelectorAll('button')].filter(vis)
               .map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,18))+'/disabled='+b.disabled):null}; })()`;
  out.before = await page.evaluate(listState);
  out.block = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:'${CAROL}'})});
     return {st:r.status, body:(await r.text()).slice(0,110)}; })()`);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8500);
  out.afterBlock = await page.evaluate(listState);
  out.unblock = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:'${CAROL}'})});
     return {st:r.status, body:(await r.text()).slice(0,110)}; })()`);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  out.afterUnblock = await page.evaluate(listState);
  return out;
};
