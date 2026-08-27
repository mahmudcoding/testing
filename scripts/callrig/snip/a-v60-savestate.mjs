const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
const toolbar = (page,id) => page.evaluate(([vs,id])=>{const vis=eval(vs);
  const r=document.querySelector(`[data-message-id="${id}"]`); if(!r) return ['<row gone>'];
  return [...r.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').slice(0,20)).filter(Boolean);},[VS,id]);
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const id = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).filter(x=>/V60-SAVED/.test(x.innerText||''));
    return m[m.length-1]?.getAttribute('data-message-id');},VS);
  out.id=id;
  const el=await page.$(`[data-message-id="${id}"]`); await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  out.afterDeletingSavedCopy_freshLoad = await toolbar(page,id);
  // and what does the saved list actually hold?
  out.savedCount = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QASAVED000003/messages?limit=50',{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=Array.isArray(j)?j:(j?.messages??j?.data??[]);
    return {status:r.status, n:Array.isArray(a)?a.length:null};});
  return out;
};
