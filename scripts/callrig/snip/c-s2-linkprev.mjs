const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const send=async(text, tag)=>{
    if(!await empty(page, comp)) return {tag, err:'not empty'};
    await comp.type(text, {delay:25}); await page.waitForTimeout(600);
    await page.keyboard.press('Enter'); await page.waitForTimeout(6000);
    return page.evaluate((tag)=>{
      const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(e=>new RegExp(tag).test(e.innerText||''));
      if(!el) return {tag, sent:false};
      const links=[...el.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),
        target:a.getAttribute('target'), rel:a.getAttribute('rel'), txt:(a.textContent||'').trim().slice(0,40)}));
      const imgs=[...el.querySelectorAll('img')].length;
      const clipped=[...el.querySelectorAll('*')].filter(e=>e.children.length===0)
        .filter(e=>e.scrollWidth>e.clientWidth+1 && e.getBoundingClientRect().width>24)
        .map(e=>({t:(e.textContent||'').trim().slice(0,26), sw:e.scrollWidth, cw:e.clientWidth}));
      return {tag, sent:true, links, imgs, clipped,
        txt:(el.innerText||'').replace(/\s+/g,' ').slice(0,110),
        rowScrollX: el.scrollWidth>el.clientWidth};
    }, tag);
  };
  out.plain   = await send('QA-S2-LINK1 https://example.com', 'QA-S2-LINK1');
  out.long    = await send('QA-S2-LINK2 https://example.com/'+'segment/'.repeat(18)+'end', 'QA-S2-LINK2');
  out.two     = await send('QA-S2-LINK3 https://example.com and https://example.org', 'QA-S2-LINK3');
  out.bare    = await send('QA-S2-LINK4 example.com', 'QA-S2-LINK4');
  await empty(page, comp);
  return out;
};
