export default async ({page}) => {
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="meeting-settings-save"]');
    if(p && vis(p)) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Meeting settings');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3500);
  const before = await page.evaluate((v)=>{ const vis=eval(v);
    const pw=[...document.querySelectorAll('input[type=password],input[type=text]')].filter(vis)
      .filter(i=>/password/i.test((i.placeholder||'')+(i.getAttribute('aria-label')||'')));
    return pw.map(i=>({type:i.type, value:i.value, ph:i.placeholder, al:i.getAttribute('aria-label')})); }, V);
  // click any Show password control
  const showed = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/show password|reveal/i.test((x.getAttribute('aria-label')||x.innerText||'')));
    if(b){ b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim(); } return null; }, V);
  await page.waitForTimeout(1500);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const pw=[...document.querySelectorAll('input[type=password],input[type=text]')].filter(vis)
      .filter(i=>/password/i.test((i.placeholder||'')+(i.getAttribute('aria-label')||'')));
    return pw.map(i=>({type:i.type, value:i.value})); }, V);
  const api = await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}`,{credentials:'include'}); const t=await r.text();
    return {pwProtected:(t.match(/"password_protected":(\w+)/)||[])[1], hasPwField:/"password"/.test(t)}; }, process.env.QA_MEETING);
  return {before, showed, after, api};
};
