export default async ({page}) => {
  const out={};
  const pt=await page.evaluate(()=>{
    let best=null;
    for (const el of document.querySelectorAll('main *')){
      const t=el.innerText||'';
      if(!/THREAD REPLY/.test(t)||!/Go to message/.test(t)) continue;
      const a=el.getBoundingClientRect().width*el.getBoundingClientRect().height;
      if(!best||a<best.a) best={el,a};
    }
    if(!best) return null;
    const el=best.el;
    const span=[...el.querySelectorAll('*')].find(e=>(e.textContent||'').trim()==='Go to message');
    const r=span.getBoundingClientRect();
    const rowR=el.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2),
      rowSelf:{tag:el.tagName, role:el.getAttribute('role'), cursor:getComputedStyle(el).cursor,
        tabindex:el.getAttribute('tabindex')},
      rowRect:[Math.round(rowR.x),Math.round(rowR.y),Math.round(rowR.width),Math.round(rowR.height)]};
  });
  out.pt=pt;
  if(!pt) return out;
  out.before=page.url();
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(5500);
  out.after=page.url();
  out.state = await page.evaluate(()=>({
    hasThread: location.search.includes('thread='),
    hasM: location.search.includes('m='),
    panels:[...document.querySelectorAll('div[contenteditable="true"]')].length,
    main:(document.querySelector('main')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,120)}));
  return out;
};
