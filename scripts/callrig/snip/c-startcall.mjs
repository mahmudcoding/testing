export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/meeting/i.test(u)&&r.request().method()==='POST'){let b=null;try{b=(await r.text()).slice(0,140);}catch(e){} net.push({s:r.status(),u:u.replace('https://airion-cargo.store',''),res:b});}});
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.hubButtons = await page.evaluate(()=>[...document.querySelectorAll('main button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,30)).slice(0,20));
  const sn = page.locator('button',{hasText:/^Start now$/}).first();
  if (!(await sn.count())) return {err:'no Start now', out};
  await sn.click();
  await page.waitForTimeout(2800);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type(process.env.QA_CALLNAME||'QA-C-1',{delay:15}); }
  out.dlgSwitches = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"] [role="switch"]')].map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,45),on:s.getAttribute('aria-checked')})));
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.url = await page.evaluate(()=>location.pathname);
  out.callId = (out.url.split('/call/')[1]||'').split('?')[0]||null;
  out.net = net;
  out.toolbar = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,25));
  return out;
};
