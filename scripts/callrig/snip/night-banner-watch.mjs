export default async ({page}) => {
  const t0=Date.now(); let seen=null;
  while (Date.now()-t0 < Number(process.env.QA_MAX||45000)) {
    const s = await page.evaluate(()=>{
      const d=document.querySelector('[data-testid="incoming-call-banner-decline"]');
      if(!d) return null;
      let box=d; for(let i=0;i<6&&box.parentElement;i++) box=box.parentElement;
      const r=box.getBoundingClientRect(), cs=getComputedStyle(box);
      const top=document.elementFromPoint(Math.round(r.left+r.width/2), Math.round(r.top+r.height/2));
      return {text:box.innerText.replace(/\n+/g,' | ').slice(0,120),
        rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],
        z:cs.zIndex, inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
        clickable: !!(top && box.contains(top)), topEl: top?top.tagName.toLowerCase():null};
    });
    if(s){ seen={at:((Date.now()-t0)/1000).toFixed(1)+'s', ...s}; break; }
    await page.waitForTimeout(400);
  }
  return seen || {none:true};
};
