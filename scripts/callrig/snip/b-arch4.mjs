export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.evaluate(()=>{[...document.querySelectorAll('button')]
    .find(e=>/archived/i.test(e.getAttribute('aria-label')||''))?.click();});
  await page.waitForTimeout(3000);
  const before = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return {none:true};
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,180),
      btns:[...d.querySelectorAll('button')].map(b=>({t:(b.innerText||'').trim().slice(0,24),
        l:(b.getAttribute('aria-label')||'').slice(0,24), vis:b.getBoundingClientRect().width>0}))};
  });
  // hover the row then re-dump (Open may be hover-revealed)
  await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    const row=[...d.querySelectorAll('*')].find(e=>/qa-archived/.test(e.innerText||'')&&e.getBoundingClientRect().width>200);
    if(row) row.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));
  });
  await page.waitForTimeout(1500);
  const afterHover = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return {none:true};
    return {btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>({t:(b.innerText||'').trim().slice(0,24), l:(b.getAttribute('aria-label')||'').slice(0,24)}))};
  });
  return {before, afterHover};
};
