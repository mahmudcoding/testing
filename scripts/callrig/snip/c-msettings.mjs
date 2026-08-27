export default async ({page}) => {
  const out={}; const net=[];
  const onRes = async r => { const u=r.url(); if(/\/meeting\//.test(u) && r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,150);}catch(e){} net.push({m:r.request().method(), u:u.replace('https://airion-cargo.store',''), s:r.status(), body:b, req:(r.request().postData()||'').slice(0,150)}); } };
  page.on('response', onRes);
  await page.evaluate(()=>{const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1]; if(d){const c=[...d.querySelectorAll('button')].find(b=>/^cancel$/i.test((b.textContent||'').trim())); if(c)c.click();}});
  await page.waitForTimeout(600); await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.locator('button[aria-label="Meeting settings"]').first().click();
  await page.waitForTimeout(2500);
  const dump = () => page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length);
    const d=ds[ds.length-1]; if(!d) return null;
    return {txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,900),
      switches:[...d.querySelectorAll('[role="switch"]')].map(s=>({l:(s.getAttribute('aria-label')||s.closest('label')?.innerText||s.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,40), on:s.getAttribute('aria-checked')})),
      inputs:[...d.querySelectorAll('input')].map(i=>({t:i.type, v:String(i.value).slice(0,40), ph:i.placeholder})),
      btns:[...d.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,30), d:b.disabled}))};
  });
  out.open = await dump();
  net.length=0;
  // toggle Reactions
  out.toggled = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const sw=[...d.querySelectorAll('[role="switch"]')].find(s=>/reaction/i.test((s.getAttribute('aria-label')||s.closest('div')?.parentElement?.innerText||'')));
    if(!sw) return null; const before=sw.getAttribute('aria-checked'); sw.click(); return {before};
  });
  await page.waitForTimeout(2500);
  out.netAfterToggle = net.slice();
  out.afterToggle = await dump();
  // type a name
  const inp = await page.$('[role="dialog"] input[type="text"], [role="dialog"] input:not([type])');
  if (inp) { await inp.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('RENAMED-C-1',{delay:20}); }
  await page.waitForTimeout(1200);
  out.afterTyping = await dump();
  // click Cancel
  out.cancelClicked = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length); const d=ds[ds.length-1];
    const c=[...d.querySelectorAll('button')].find(b=>/^cancel$/i.test((b.textContent||'').trim())); if(!c||c.disabled) return false; c.click(); return true;
  });
  await page.waitForTimeout(2000);
  // reopen
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.locator('button[aria-label="Meeting settings"]').first().click();
  await page.waitForTimeout(2500);
  out.reopened = await dump();
  out.net = net;
  page.off('response', onRes);
  return out;
};
