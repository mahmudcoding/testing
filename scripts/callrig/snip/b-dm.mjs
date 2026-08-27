export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QBGENERAL0001`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.evaluate(()=>{[...document.querySelectorAll('button,a')]
    .find(e=>/new direct message/i.test(e.getAttribute('aria-label')||''))?.click();});
  await page.waitForTimeout(4000);
  const step1 = await page.evaluate(()=>({url:location.href.replace(/^https:\/\/[^/]+/,''),
    people:[...document.querySelectorAll('button,a,li,tr')].filter(e=>{
      const r=e.getBoundingClientRect(); return r.width>0&&/bob/i.test(e.innerText||'');})
      .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,50), tag:e.tagName})).slice(0,4)}));
  // click the Bob row
  const opened = await page.evaluate(()=>{
    const row=[...document.querySelectorAll('button,a,li,tr')].filter(e=>{
      const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&/bob/i.test(e.innerText||'');})[0];
    if(!row) return false; row.click(); return true;
  });
  await page.waitForTimeout(4000);
  const step2 = await page.evaluate(()=>({url:location.href.replace(/^https:\/\/[^/]+/,''),
    dialogs:[...document.querySelectorAll('[role=dialog]')].filter(d=>d.getBoundingClientRect().width>0)
      .map(d=>({text:(d.innerText||'').replace(/\s+/g,' ').slice(0,120),
        btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
          .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22))})),
    hasComposer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')}));
  return {step1, opened, step2};
};
