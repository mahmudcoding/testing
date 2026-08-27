export default async ({page}) => {
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="meeting-settings-save"]');
    if(p && vis(p)) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Meeting settings');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3000);
  const toggled = await page.evaluate((v)=>{ const vis=eval(v);
    const t=document.querySelector('[data-testid="meeting-settings-password-toggle"]');
    if(!t) return {noToggle:true};
    const was=t.getAttribute('aria-checked');
    if(was==='true') t.click();
    return {was}; }, V);
  await page.waitForTimeout(1200);
  const saved = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('data-testid')||'')==='meeting-settings-save');
    if(b && !b.disabled){ b.click(); return true; } return {dis:b?b.disabled:'notfound'}; }, V);
  await page.waitForTimeout(5000);
  const api = await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}`,{credentials:'include'}); const t=await r.text();
    return {pw:(t.match(/"password_protected":(\w+)/)||[])[1]}; }, process.env.QA_MEETING);
  return {toggled, saved, api};
};
