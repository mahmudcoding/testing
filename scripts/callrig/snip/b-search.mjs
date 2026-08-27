export default async ({page}) => {
  const q=process.env.QA_Q||'broadcast';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button,input')].find(e=>{
      const r=e.getBoundingClientRect();
      return r.width>0&&/search/i.test((e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.innerText||''));});
    if(!b) return null; b.click(); return (b.getAttribute('aria-label')||b.getAttribute('placeholder')||b.innerText||'').slice(0,30);
  });
  await page.waitForTimeout(1800);
  const inp = await page.evaluate(()=>{
    const i=[...document.querySelectorAll('input')].find(e=>{const r=e.getBoundingClientRect();
      return r.width>0&&r.height>0&&/search/i.test((e.getAttribute('placeholder')||e.getAttribute('aria-label')||''));});
    if(!i) return null; i.focus(); return (i.getAttribute('placeholder')||i.getAttribute('aria-label')||'').slice(0,40);
  });
  if(inp){ await page.keyboard.type(q,{delay:60}); await page.waitForTimeout(1000); await page.keyboard.press('Enter'); }
  await page.waitForTimeout(4500);
  const res = await page.evaluate(()=>{
    const main=(document.querySelector('[role=dialog]')?.innerText||document.querySelector('main')?.innerText||'').replace(/\s+/g,' ');
    return {url:location.href.replace(/^https:\/\/[^/]+/,''), len:main.length, head:main.slice(0,320),
      hasBackslash:/\\/.test(main)};
  });
  const api = await page.evaluate(async(q)=>{
    const r=await fetch(`/api/v1/search?q=${encodeURIComponent(q)}&workspace_id=W4QBF1XTURESO01`,{credentials:'include'});
    const t=await r.text(); return {s:r.status, body:t.slice(0,280)};
  }, q);
  return {opened, inp, res, api};
};
