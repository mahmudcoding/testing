export default async ({page}) => {
  const TID=process.env.QA_TID||'meeting-settings-entry-open';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="meeting-settings-save"]');
    if(p && vis(p)) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Meeting settings');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3000);
  const before = await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}`,{credentials:'include'}); const t=await r.text();
    return {req:(t.match(/"requires_approval":(\w+)/)||[])[1]}; }, process.env.QA_MEETING);
  const clicked = await page.evaluate(({v,tid})=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('[data-testid]')].filter(vis).find(e=>e.getAttribute('data-testid')===tid);
    if(b){ b.click(); return {t:(b.innerText||'').trim(), checked:b.getAttribute('aria-checked')}; } return {notFound:true}; }, {v:V, tid:TID});
  await page.waitForTimeout(5000);
  const after = await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}`,{credentials:'include'}); const t=await r.text();
    return {req:(t.match(/"requires_approval":(\w+)/)||[])[1]}; }, process.env.QA_MEETING);
  const panel = await page.evaluate((v)=>{ const vis=eval(v);
    const p=[...document.querySelectorAll('[data-testid="participants-list"]')].filter(vis).pop();
    return p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,240):null; }, V);
  return {before, clicked, after, participantsPanel: panel};
};
