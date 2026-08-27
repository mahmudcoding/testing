import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // pick an OLD message (near the top of history) so scrolling is required
  const target = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QEGENERAL0001/messages?limit=100',{credentials:'include'});
    const b=await r.json(); const a=b.messages||b.data||[];
    const arr=Array.isArray(a)?a:[];
    return arr.length? {id:arr[0].id, body:(arr[0].body||'').slice(0,40), total:arr.length} : null;
  }).catch(()=>null);
  if(!target) {
    await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
  }
  const t = target || await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QEGENERAL0001/messages?limit=100',{credentials:'include'});
    const b=await r.json(); const a=b.messages||b.data||[]; const arr=Array.isArray(a)?a:[];
    return {id:arr[0].id, body:(arr[0].body||'').slice(0,40), total:arr.length};
  });
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001?m=${t.id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const res = await page.evaluate((id)=>{
    const el=document.querySelector(`[data-message-id="${id}"]`);
    if(!el) return {rendered:false, totalRendered:document.querySelectorAll('[data-message-id]').length};
    const r=el.getBoundingClientRect();
    const cs=getComputedStyle(el);
    // is it in view, and does it look highlighted vs a neighbour?
    const others=[...document.querySelectorAll('[data-message-id]')].filter(x=>x!==el);
    const neighbour=others[Math.floor(others.length/2)];
    const nb=neighbour?getComputedStyle(neighbour):null;
    return {rendered:true, totalRendered:document.querySelectorAll('[data-message-id]').length,
      inViewport: r.top>=0 && r.bottom<=innerHeight,
      rectTop:Math.round(r.top), viewportH:innerHeight,
      bg:cs.backgroundColor, neighbourBg:nb?nb.backgroundColor:null,
      differsFromNeighbour: !!nb && (cs.backgroundColor!==nb.backgroundColor || cs.outlineColor!==nb.outlineColor || cs.boxShadow!==nb.boxShadow),
      outline:cs.outlineStyle+' '+cs.outlineColor, boxShadow:cs.boxShadow.slice(0,40),
      cls:(el.className||'').toString().slice(0,80)};
  }, t.id);
  return {target:{body:t.body, total:t.total}, result:res};
};
