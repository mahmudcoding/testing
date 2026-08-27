// Open the lightbox on the MIDDLE image and see whether it shows that one.
export default async ({page}) => {
  const out={};
  const msg=page.locator('main [data-message-id]').filter({hasText:'QA-S2-GALLERY'}).last();
  await msg.scrollIntoViewIfNeeded();
  await msg.locator('button[aria-label="Open qa-s2-v2.png"]').click();
  await page.waitForTimeout(2500);
  const read=()=>page.evaluate(()=>{
    const dlg=document.querySelector('[role="dialog"]');
    if(!dlg) return {noDialog:true};
    const imgs=[...dlg.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().width>40)
      .map(i=>({nw:i.naturalWidth,nh:i.naturalHeight,alt:i.alt}));
    const btns=[...dlg.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>0)
      .map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,22));
    return {imgs, btns, text:(dlg.innerText||'').replace(/\s+/g,' ').slice(0,120)};
  });
  out.opened=await read();
  // next
  const nextSel='[role="dialog"] button[aria-label*="ext"], [role="dialog"] button[aria-label*="orward"]';
  out.hasNext=await page.locator(nextSel).count();
  if (out.hasNext){ await page.locator(nextSel).first().click(); await page.waitForTimeout(1200); out.afterNext=await read(); }
  // keyboard arrows
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1200);
  out.afterArrowRight=await read();
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(1200);
  out.afterArrowLeft=await read();
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  out.afterEscape=await page.evaluate(()=>({dialog:!!document.querySelector('[role="dialog"]')}));
  return out;
};
