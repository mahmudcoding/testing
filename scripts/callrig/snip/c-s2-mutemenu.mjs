export default async ({page}) => {
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  await page.locator(sel).first().click(); await page.waitForTimeout(900);
  const items=await page.evaluate(()=>{
    const res=[]; const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_ELEMENT);
    let n; while((n=w.nextNode())){ if(n.children.length) continue;
      const r=n.getBoundingClientRect(); if(r.width<2||r.height<2) continue;
      if (r.x<1200) continue;                       // the popper sits on the right
      res.push({t:(n.textContent||'').trim().slice(0,30), y:Math.round(r.y), x:Math.round(r.x)});
    } return res;
  });
  return {items};
};
