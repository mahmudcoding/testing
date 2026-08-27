export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  const visibleTimes=()=>page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const re=/\d{1,2}:\d{2}/;
    const hits=[];
    for(const el of document.querySelectorAll('body *')){
      if(el.children.length) continue;
      const t=(el.textContent||'').trim();
      if(t.length>34||!re.test(t)) continue;
      if(!vis(el)) continue;
      hits.push(t);
    }
    return [...new Set(hits)];
  });
  out.beforeMute = (await visibleTimes()).slice(0,12);
  // mute so the popover shows its "Muted until" line
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  await page.locator(sel).first().click(); await page.waitForTimeout(900);
  const pt=await page.evaluate(()=>{const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_ELEMENT);
    let n; while((n=w.nextNode())){ if(n.children.length) continue;
      if((n.textContent||'').trim()==='For 1 hour'){const r=n.getBoundingClientRect();
        return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};}} return null;});
  if(pt){ await page.mouse.click(pt.x,pt.y); await page.waitForTimeout(1600); }
  await page.locator(sel).first().click(); await page.waitForTimeout(1000);
  out.mutePopover = await page.evaluate(()=>{const w=document.querySelector('[data-radix-popper-content-wrapper]');
    return w?(w.innerText||'').replace(/\s+/g,' ').slice(0,60):'none';});
  out.withMute = (await visibleTimes()).slice(0,14);
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  // restore: unmute
  await page.locator(sel).first().click(); await page.waitForTimeout(900);
  const un=page.locator('[data-radix-popper-content-wrapper] button').filter({hasText:'Unmute'}).first();
  if(await un.count()){ await un.click(); await page.waitForTimeout(1500); } else await page.keyboard.press('Escape');
  out.restored = await page.evaluate((s)=>(document.querySelector(s)||{}).ariaLabel, sel);
  return out;
};
