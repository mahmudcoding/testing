const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return j?.email??j?.data?.email;});
  // ensure Side Rooms panel is open
  const openBtn = page.locator('button[aria-label="Side Rooms"]').first();
  let panelTxt = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,300):'';},VS);
  if(!/Side Rooms/i.test(panelTxt) && await openBtn.count()){ await openBtn.click().catch(()=>{}); await page.waitForTimeout(2500); }
  const s = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { url:location.pathname,
      panel:(d.innerText||'').replace(/\s+/g,' ').slice(0,320),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,16),
      mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,180),
      banner:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/side room|main room|you.re in|back to main/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,50)).slice(0,6) };},VS);
  return { who, ...s };
};
