export default async ({page, ctx}) => {
  try { await ctx.grantPermissions(['clipboard-read','clipboard-write'],
    {origin:'https://airion-cargo.store'}); } catch(e){}
  const out={};
  out.pixel=await page.evaluate(async ()=>{
    try{
      const items=await navigator.clipboard.read();
      const t=items[0].types.find(x=>x.startsWith('image/'));
      const blob=await items[0].getType(t);
      const bmp=await createImageBitmap(blob);
      const c=new OffscreenCanvas(bmp.width,bmp.height);
      const g=c.getContext('2d'); g.drawImage(bmp,0,0);
      const d=g.getImageData(Math.floor(bmp.width/2),Math.floor(bmp.height/2),1,1).data;
      return {w:bmp.width,h:bmp.height,rgb:[d[0],d[1],d[2]]};
    }catch(e){ return 'FAILED: '+String(e.message).slice(0,60); }});
  // is there a per-image context menu?
  const id='M4OXFPK7R352QL5';
  const imgs=page.locator(`[data-message-id="${id}"] img`);
  out.imgCount=await imgs.count();
  if(out.imgCount>1){
    await imgs.nth(1).click({button:'right',timeout:6000}).catch(()=>{out.rightClickFail=true});
    await page.waitForTimeout(3000);
    out.perImageMenu=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
      return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
        .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22)).filter(Boolean):'NO-MENU';});
  }
  return out;
};
