export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  const tag='QA-RCPT-'+Math.random().toString(36).slice(2,5);
  await comp.click(); await comp.type(tag,{delay:35}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(6000);
  return page.evaluate((tag)=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>(x.innerText||'').includes(tag));
    if(!e) return {tag, found:false};
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {tag, found:true, id:e.getAttribute('data-message-id'),
      labels:[...e.querySelectorAll('*')].filter(v)
        .map(x=>x.getAttribute('aria-label')||x.getAttribute('title')||'')
        .filter(t=>/sent|read|seen|deliver|прочит/i.test(t)).slice(0,4),
      text:(e.innerText||'').replace(/\s+/g,' ').slice(-40)};}, tag);
};
