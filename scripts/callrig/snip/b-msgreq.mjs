export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(e=>{const r=e.getBoundingClientRect();
      return r.width>0&&/message requests/i.test(e.getAttribute('aria-label')||'');});
    if(!b) return null; const l=b.getAttribute('aria-label'); b.click(); return l;
  });
  await page.waitForTimeout(3000);
  const view = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    const scope = d || document.querySelector('main') || document.body;
    return {isDialog:!!d, url:location.href.replace(/^https:\/\/[^/]+/,''),
      text:(scope.innerText||'').replace(/\s+/g,' ').slice(0,240),
      btns:[...scope.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24)).slice(0,12)};
  });
  return {opened, view};
};
