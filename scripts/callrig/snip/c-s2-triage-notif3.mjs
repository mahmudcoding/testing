export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const state=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const tp=[...document.querySelectorAll('aside,[role="dialog"],section')].filter(v)
      .find(d=>/Replies \(/.test(d.innerText||''));
    return {url:location.pathname+location.search, threadPanelOpen:!!tp,
      threadHeader:tp? ((tp.innerText||'').match(/Replies \(\d+\)/)||[''])[0]:null};});
  out.before=await state();
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3500);
  const btn=page.locator('button[aria-label*="New thread reply"]').first();
  out.entryFound=await btn.count();
  if(!out.entryFound){
    out.available=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('button[aria-label]')].filter(v)
        .map(b=>b.getAttribute('aria-label')).filter(a=>/message|mention|reply/i.test(a)).slice(0,6);});
    return out;
  }
  out.entryLabel=await btn.getAttribute('aria-label');
  await btn.click();
  await page.waitForTimeout(7000);
  out.after=await state();
  out.changedUrl = out.before.url!==out.after.url;
  out.openedThread = out.after.threadPanelOpen && !out.before.threadPanelOpen;
  return out;
};
