export default async ({page}) => {
  const N = process.env.QA_LIMIT || '1';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="meeting-settings-save"]');
    if(p && vis(p)) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Meeting settings');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3000);
  const inp = await page.$('[data-testid="meeting-settings-max-participants-input"]');
  if(!inp) return {noInput:true};
  await inp.click({clickCount:3});
  await page.keyboard.press('Backspace');
  await inp.type(N, {delay:60});
  await page.waitForTimeout(700);
  const fieldBefore = await page.evaluate(()=>{
    const i=document.querySelector('[data-testid="meeting-settings-max-participants-input"]');
    return {value:i.value, valid:i.checkValidity(), min:i.min, max:i.max}; });
  const saveState = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('data-testid')||'')==='meeting-settings-save');
    return b?{dis:b.disabled}:null; }, V);
  await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('data-testid')||'')==='meeting-settings-save');
    if(b && !b.disabled) b.click(); }, V);
  await page.waitForTimeout(4500);
  const fieldAfter = await page.evaluate(()=>{
    const i=document.querySelector('[data-testid="meeting-settings-max-participants-input"]');
    return i?i.value:null; });
  const api = await page.evaluate(async(m)=>{
    const r=await fetch(`/api/v1/meeting/${m}`,{credentials:'include'}); const t=await r.text();
    return {max:(t.match(/"max_participants":(\d+)/)||[])[1]}; }, process.env.QA_MEETING);
  const toasts = await page.evaluate((v)=>{ const vis=eval(v);
    return [...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))]; }, V);
  return {typed:N, fieldBefore, saveState, fieldAfter, api, toasts};
};
