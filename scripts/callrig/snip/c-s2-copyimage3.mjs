export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OXFPK7R352QL5';
  try { await ctx.grantPermissions(['clipboard-read','clipboard-write'],
    {origin:'https://airion-cargo.store'}); } catch(e){}
  const decode=()=>page.evaluate(async ()=>{
    try{
      const items=await navigator.clipboard.read();
      const t=items[0].types.find(x=>x.startsWith('image/'));
      const bmp=await createImageBitmap(await items[0].getType(t));
      const c=new OffscreenCanvas(bmp.width,bmp.height);
      const g=c.getContext('2d'); g.drawImage(bmp,0,0);
      const d=g.getImageData(Math.floor(bmp.width/2),Math.floor(bmp.height/2),1,1).data;
      return [d[0],d[1],d[2]];
    }catch(e){ return 'FAILED'; }});
  const run=async(which)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(11000);
    await page.evaluate(()=>navigator.clipboard.writeText('SENTINEL')).catch(()=>{});
    const msg=page.locator(`[data-message-id="${id}"]`).first();
    await msg.scrollIntoViewIfNeeded().catch(()=>{});
    const imgs=msg.locator('img');
    await imgs.nth(which).click({button:'right',timeout:6000}).catch(()=>{});
    await page.waitForTimeout(2500);
    const alt=await imgs.nth(which).evaluate(i=>(i.getAttribute('alt')||i.getAttribute('src')||'').split('/').pop().slice(0,24));
    await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
      .filter({hasText:/^Copy image$/}).first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(4000);
    return {rightClickedIndex:which, rightClickedFile:alt, clipboardRGB:await decode()};
  };
  return {first:await run(0), second:await run(1),
          legend:{img1:'(200,40,40) red', img2:'(40,160,200) blue'}};
};
