export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const out={};
  const chans = await page.evaluate(async (ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'}); const j=await r.json();
    const l=Array.isArray(j)?j:(j.channels||j.items||[]); return l.map(c=>({id:c.id,name:c.name}));
  }, WS);
  const gen = chans.find(c=>/general/.test(c.name));
  out.chan=gen;
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${gen.id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.btns = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(l=>/call/i.test(l)).slice(0,8));
  const sc = page.locator('button', {hasText:/^Start call$/}).first();
  if (await sc.count()) { await sc.click(); }
  else { const b = page.locator('button[aria-label*="call" i]').first(); if (await b.count()) await b.click(); }
  await page.waitForTimeout(3000);
  out.afterClick = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    return {url:location.pathname, dlg: d? (d.innerText||'').replace(/\n+/g,' | ').slice(0,250):null,
      dlgBtns: d? [...d.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(Boolean).slice(0,8):null};
  });
  const st = page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first();
  if (await st.count()) { await st.click(); await page.waitForTimeout(9000); }
  out.final = await page.evaluate(()=>({url:location.pathname}));
  out.callId=(out.final.url.split('/call/')[1]||'').split('?')[0];
  return out;
};
