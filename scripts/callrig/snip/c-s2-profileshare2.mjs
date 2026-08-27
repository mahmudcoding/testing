const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  const out={}; const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET')
    resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,50)}); });
  await page.locator('[role="dialog"] button').filter({hasText:/^Share$/}).last().click({timeout:10000});
  await page.waitForTimeout(2500);
  out.afterShare = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis);
    const d=ds[ds.length-1];
    return {dialogs:ds.length, text: d? d.innerText.replace(/\n+/g,' | ').slice(0,240):null,
      buttons: d? [...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean):null,
      inputs: d? [...d.querySelectorAll('input')].filter(vis).map(i=>i.getAttribute('placeholder')||i.getAttribute('aria-label')):null};
  });
  // if a target picker appeared, pick the private channel and send
  const pick = page.locator('[role="dialog"] button').filter({hasText:/^qa-private$/});
  out.pickCount = await pick.count();
  if (out.pickCount) {
    await pick.first().click({timeout:8000}); await page.waitForTimeout(900);
    const cont = page.locator('[role="dialog"] button:visible').filter({hasText:/^(Continue|Send|Share)$/});
    if (await cont.count()) { await cont.last().click({timeout:8000}); await page.waitForTimeout(2000);
      const send = page.locator('[role="dialog"] button:visible').filter({hasText:/^Send$/});
      if (await send.count()) { await send.last().click({timeout:8000}); await page.waitForTimeout(4000); } }
  }
  out.resp = resp;
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  out.channelAfter = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {text: el? el.innerText.replace(/\n+/g,' | ').slice(0,140):null};
  });
  return out;
};
