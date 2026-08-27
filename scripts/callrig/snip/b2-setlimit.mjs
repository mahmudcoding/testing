export default async ({page}) => {
  const N = process.env.QA_LIMIT || '2';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="meeting-settings-save"]');
    if(p && vis(p)) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Meeting settings');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3000);
  const inp = await page.$('[data-testid="meeting-settings-max-participants-input"]');
  if(!inp) return {noInput:true};
  await inp.fill('');
  await inp.fill(N);
  await page.waitForTimeout(500);
  const saved = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('data-testid')||'')==='meeting-settings-save');
    if(b && !b.disabled){ b.click(); return true; } return {dis:b?b.disabled:'notfound'}; }, V);
  await page.waitForTimeout(4000);
  const api = await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}`,{credentials:'include'});
    const t=await r.text();
    const mm=t.match(/"max_participants":(\d+)/);
    return {s:r.status, max: mm?mm[1]:null};
  }, process.env.QA_MEETING);
  return {saved, api};
};
