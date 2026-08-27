export default async ({page}) => {
  const TID=process.env.QA_TID;
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="meeting-settings-save"]');
    if(p && vis(p)) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Meeting settings');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3000);
  const before = await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}/settings`,{credentials:'include'}); return await r.text(); }, process.env.QA_MEETING);
  const res = await page.evaluate(({v,tid})=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('[data-testid]')].filter(vis).find(e=>e.getAttribute('data-testid')===tid);
    if(!b) return {notFound:true};
    const was=b.getAttribute('aria-checked')||b.getAttribute('aria-pressed');
    b.click();
    return {was, now:b.getAttribute('aria-checked')||b.getAttribute('aria-pressed')}; }, {v:V, tid:TID});
  await page.waitForTimeout(5000);
  const after = await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}/settings`,{credentials:'include'}); return await r.text(); }, process.env.QA_MEETING);
  return {res, before: before.slice(0,320), after: after.slice(0,320)};
};
