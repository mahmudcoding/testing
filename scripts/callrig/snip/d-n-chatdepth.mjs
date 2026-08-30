export default async ({page}) => {
  const out={};
  if (process.env.QA_RELOAD){ await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000);
    for (const t of ['Join call','Join now','Join']) { const b=page.locator('button',{hasText:new RegExp('^'+t+'$')}).first();
      if(await b.count()>0 && await b.isVisible().catch(()=>false)){const bx=await b.boundingBox(); await page.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2); await page.waitForTimeout(8000); break;} } }
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(4000); }
  const read = async ()=> await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('[data-testid="ic-user-message"]')];
    const list=document.querySelector('[data-testid="in-call-chat-list"]');
    const txt=rows.map(r=>((r.innerText||'').match(/DN-[A-Z0-9-]+/)||[(r.innerText||'').replace(/\s+/g,' ').slice(0,24)])[0]);
    return {n:rows.length, first:txt[0], last:txt[txt.length-1],
      scroll: list?{top:Math.round(list.scrollTop),h:Math.round(list.scrollHeight),c:Math.round(list.clientHeight)}:null};
  });
  out.initial = await read();
  // scroll the list to the very top, repeatedly, to trigger any older-page load
  for(let i=0;i<6;i++){
    await page.evaluate(()=>{const l=document.querySelector('[data-testid="in-call-chat-list"]'); if(l) l.scrollTop=0;});
    await page.waitForTimeout(2500);
  }
  out.afterScrollUp = await read();
  // and to the bottom
  await page.evaluate(()=>{const l=document.querySelector('[data-testid="in-call-chat-list"]'); if(l) l.scrollTop=l.scrollHeight;});
  await page.waitForTimeout(2500);
  out.afterScrollDown = await read();
  return out;
};
