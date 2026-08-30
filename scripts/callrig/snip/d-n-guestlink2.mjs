export default async ({page}) => {
  const out={};
  const b = page.locator('[data-testid="call-controls-add-to-call"]').first();
  const st = await page.evaluate(()=>!![...document.querySelectorAll('[role=dialog]')].find(d=>/Invite to this call/.test(d.innerText||'')));
  if(!st){ const box=await b.boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2); await page.waitForTimeout(3000); }
  out.url = await page.evaluate(()=>{
    const i=document.querySelector('[data-testid="guest-links-created-url"] input, [data-testid="guest-links-created-url"]');
    if(i && i.value!==undefined) return {from:'input', v:i.value, len:i.value.length};
    const all=[...document.querySelectorAll('input')].map(x=>x.value).filter(v=>/\/join\//.test(v));
    return {from:'scan', v:all[0]||null, len:(all[0]||'').length};
  });
  out.section = await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="guest-links-section"]');
    return s?(s.innerText||'').replace(/\s+/g,' ').slice(0,400):null;});
  return out;
};
