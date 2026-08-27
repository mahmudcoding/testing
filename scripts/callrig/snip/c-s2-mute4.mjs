export default async ({page}) => {
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const find=()=>page.evaluate(()=>{
    const hits=[];
    const re=/For 1 hour|For 4 hours|For 1 day|Until turned off|Muted until/;
    const w=document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
    let n;
    while((n=w.nextNode())){
      if (n.children.length) continue;
      const t=(n.textContent||'').trim();
      if (re.test(t)) { const r=n.getBoundingClientRect(); const cs=getComputedStyle(n);
        hits.push({t:t.slice(0,26), rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
          disp:cs.display, vis:cs.visibility, op:cs.opacity}); }
    }
    return {hits, textLen:document.body.innerText.length,
      expanded:(document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]')||{}).ariaExpanded,
      popups:document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"],[data-state="open"]').length};
  });
  const before=await find();
  await page.locator(sel).first().click();
  const after=[];
  for (let i=0;i<8;i++){ await page.waitForTimeout(350); after.push(await find()); }
  return {before, t350:after[0], t1050:after[2], t2800:after.at(-1),
    anyHit: after.some(a=>a.hits.length>0), anyPopup: after.some(a=>a.popups>0)};
};
