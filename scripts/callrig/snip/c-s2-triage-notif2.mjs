export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  // start IN the notification's own channel, so a sidebar click would change nothing
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const state=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const tp=[...document.querySelectorAll('aside,[role="dialog"],section')].filter(v)
      .find(d=>/Replies \(/.test(d.innerText||''));
    return {url:location.pathname+location.search,
      threadPanelOpen:!!tp,
      threadHeader:tp? ((tp.innerText||'').match(/Replies \(\d+\)/)||[''])[0]:null};});
  out.before=await state();
  const bell=page.locator('button[aria-label^="Notifications"]').first();
  await bell.click(); await page.waitForTimeout(3000);
  const entry=page.locator('*').filter({hasText:/^QA-T4-NOTIF reply from other$/}).last();
  out.entryFound=await entry.count();
  if(out.entryFound){
    out.entryText=(await entry.innerText()).replace(/\s+/g,' ').slice(0,50);
    await entry.click();
    await page.waitForTimeout(7000);
  }
  out.after=await state();
  out.changed = out.before.url!==out.after.url || out.before.threadPanelOpen!==out.after.threadPanelOpen;
  return out;
};
