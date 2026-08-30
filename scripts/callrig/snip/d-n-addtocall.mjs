export default async ({page}) => {
  const out={};
  const b = page.locator('[data-testid="call-controls-add-to-call"]').first();
  out.found = await b.count();
  if(!out.found){ out.toolbar = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>1).map(x=>x.dataset.testid||x.getAttribute('aria-label')).filter(Boolean).slice(-16)); return out; }
  const box=await b.boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(3500);
  out.dlg = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(d=>d.dataset.testid!=='call-overlay-expanded');
    const d=ds[ds.length-1]; if(!d) return null;
    const links=[...d.querySelectorAll('input')].map(i=>i.value).filter(v=>/\/join\//.test(v));
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,400),
      testids:[...new Set([...d.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid))],
      guestSection: !!d.querySelector('[data-testid="guest-links-section"]'),
      linkCount: links.length, linkLen: links[0]?links[0].length:0,
      btns:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim()).filter(Boolean)};
  });
  return out;
};
