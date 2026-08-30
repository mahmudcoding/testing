export default async ({page}) => {
  const out={marks:[]}; const mark=n=>out.marks.push({n,at:Date.now()});
  const btn = page.locator('[data-testid="call-controls-screen-share"]').first();
  out.label0 = await btn.getAttribute('aria-label');
  const box = await btn.boundingBox();
  mark('click'); await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  const t0=Date.now(); const changes=[]; let prev=null;
  while(Date.now()-t0<25000){
    const s = await page.evaluate(()=>{
      const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const b=document.querySelector('[data-testid="call-controls-screen-share"]');
      const toasts=[...document.querySelectorAll('[data-sonner-toast]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,100));
      const tiles=[...document.querySelectorAll('[data-testid*="tile"],[data-testid*="share"]')].map(e=>e.dataset.testid);
      return {btn:b?{l:b.getAttribute('aria-label'),dis:b.disabled,active:b.getAttribute('data-active')}:null, toasts, tiles:[...new Set(tiles)],
        gdm: (window.__gdmCalls||[]).length};
    });
    const k=JSON.stringify(s); if(k!==prev){changes.push({at:Date.now(),...s}); prev=k;}
    await page.waitForTimeout(400);
  }
  out.changes=changes;
  return out;
};
