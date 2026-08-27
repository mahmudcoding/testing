export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QBGENERAL0001`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/channels/archived',{credentials:'include'});
    const t=await r.text(); return {s:r.status, body:t.slice(0,300)};
  });
  const opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(e=>{const r=e.getBoundingClientRect();
      return r.width>0&&/archived/i.test(e.getAttribute('aria-label')||'');});
    if(!b) return null; b.click(); return b.getAttribute('aria-label');
  });
  await page.waitForTimeout(3000);
  const list = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    const scope=d||document.querySelector('main')||document.body;
    return {isDialog:!!d, text:(scope.innerText||'').replace(/\s+/g,' ').slice(0,220),
      items:[...scope.querySelectorAll('button,a,li')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)).slice(0,10)};
  });
  return {api, opened, list};
};
