export default async ({page}) => {
  const out={};
  const b = page.locator('[data-testid="call-controls-add-to-call"]').first();
  out.found = await b.count();
  if(!out.found) return out;
  const box=await b.boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(3000);
  out.dlg = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(d=>d.dataset.testid!=='call-overlay-expanded');
    const d=ds[ds.length-1]; if(!d) return null;
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,500),
      btns:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim()).filter(Boolean).slice(0,20),
      tabs:[...d.querySelectorAll('[role=tab]')].map(x=>x.innerText.trim()),
      testids:[...d.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).slice(0,25),
      inputs:[...d.querySelectorAll('input')].map(i=>({ph:i.placeholder,v:String(i.value).slice(0,90),ro:i.readOnly}))};
  });
  return out;
};
