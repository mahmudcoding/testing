export default async ({page}) => {
  const out={};
  out.before = await page.evaluate(()=>({
    backdrops:[...document.querySelectorAll('.aloqa-modal-backdrop')].length,
    dialogs:[...document.querySelectorAll('[role=dialog]')].filter(d=>{const r=d.getBoundingClientRect();return r.width>1&&r.width<900;}).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,120))}));
  for (const lbl of ['Cancel','Close']) {
    const b = page.locator(`[role=dialog] button`, {hasText:new RegExp('^'+lbl+'$')}).last();
    if (await b.count()>0 && await b.isVisible().catch(()=>false)) {
      const box = await b.boundingBox();
      if(box){ await page.mouse.click(box.x+box.width/2, box.y+box.height/2); out.clicked=lbl; await page.waitForTimeout(1500); break; }
    }
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  out.after = await page.evaluate(()=>({
    backdrops:[...document.querySelectorAll('.aloqa-modal-backdrop')].length,
    dialogs:[...document.querySelectorAll('[role=dialog]')].filter(d=>{const r=d.getBoundingClientRect();return r.width>1&&r.width<900;}).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,120))}));
  return out;
};
