// Enable 2FA, then track the toast and the Confirm button geometry over time.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/security`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const out={viewport: await page.evaluate(()=>({w:innerWidth,h:innerHeight}))};
  const en = page.locator('main button').filter({hasText:/^Enable$/}).first();
  if(!(await en.count())) return {err:'no Enable button'};
  await en.scrollIntoViewIfNeeded(); await en.click();
  await page.waitForTimeout(2500);
  out.samples=[];
  for (let i=0;i<12;i++){
    const s = await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
      const btn=[...document.querySelectorAll('main button')].find(b=>/^Confirm$/.test(b.innerText.trim()));
      const toasts=[...document.querySelectorAll('[data-sonner-toast]')].filter(vis).map(t=>{
        const r=t.getBoundingClientRect();
        return {txt:(t.innerText||'').replace(/\s+/g,' ').slice(0,70),
          x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),
          pe:getComputedStyle(t).pointerEvents};
      });
      if(!btn) return {btn:null, toasts};
      const br=btn.getBoundingClientRect();
      const cx=br.left+br.width/2, cy=br.top+br.height/2;
      const top=(cx>=0&&cy>=0&&cx<innerWidth&&cy<innerHeight)?document.elementFromPoint(cx,cy):null;
      return {btn:{x:Math.round(br.left),y:Math.round(br.top),w:Math.round(br.width),h:Math.round(br.height)},
        topAtCentre: top? (top.tagName+(top.getAttribute('data-sonner-toast')!==null?'[toast]':'')+':'+(top.innerText||'').replace(/\s+/g,' ').slice(0,24)) : 'null',
        toasts};
    });
    out.samples.push({t:i*1000, ...s});
    await page.waitForTimeout(1000);
  }
  return out;
};
