export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(13000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  const tag='QA-NOTE-'+Math.random().toString(36).slice(2,5);
  await comp.click(); await page.keyboard.type(tag);
  await page.waitForTimeout(700);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(7000);
  const out={tag};
  const menuOf=async(locator)=>{
    await locator.scrollIntoViewIfNeeded().catch(()=>{});
    await locator.hover(); await page.waitForTimeout(1400);
    const more=locator.locator('button[aria-label="More actions"]').first();
    if(!await more.count()) return 'no More actions';
    await more.click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(2500);
    const items=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
      return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
        .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean):'NO-MENU';});
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(1200);
    return items;
  };
  out.noteMenu=await menuOf(page.locator('main [data-message-id]').filter({hasText:tag}).last());
  const saved=page.locator('main [data-message-id]').filter({hasText:'QA-SAVEDRM'}).last();
  if(await saved.count()) out.savedCopyMenu=await menuOf(saved);
  return out;
};
