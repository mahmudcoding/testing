export default async ({page}) => {
  await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const b=[...document.querySelectorAll('button')].filter(v).find(x=>(x.getAttribute('aria-label')||'')==='Meeting settings');
    if(b) b.click();
  });
  await page.waitForTimeout(3500);
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const panel=document.querySelector('[data-testid*="meeting-settings"],[data-testid*="settings-panel"]') || document.querySelector('aside') || document.body;
    const btns=[...panel.querySelectorAll('button,input')].filter(v).map((b,i)=>({i, tag:b.tagName, type:b.type||undefined,
      tid:b.getAttribute('data-testid')||undefined, al:(b.getAttribute('aria-label')||'').slice(0,40)||undefined,
      txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)||undefined,
      press:b.getAttribute('aria-pressed')||undefined, checked:b.checked||undefined, role:b.getAttribute('role')||undefined}));
    return {n:btns.length, btns: btns.slice(0,60)};
  });
};
