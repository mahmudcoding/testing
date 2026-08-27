const WS='W4QCF1XTURESO01', ARCH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${ARCH}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  const out={}; const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET')
    resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,48)}); });
  const row = page.locator('[data-message-id]').last();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(900);
  out.rowText = ((await row.innerText().catch(()=>''))||'').replace(/\n+/g,' | ').slice(0,60);
  out.buttons = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(Boolean);
  });
  try { await row.locator('button[aria-label="Save"]').first().click({timeout:8000}); out.saveClicked=true; }
  catch(e){ out.saveErr=String(e).slice(0,70); }
  await page.waitForTimeout(3000);
  out.resp = resp;
  out.afterSave = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {buttons:[...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(Boolean),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
  });
  // check the Saved page
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`,{waitUntil:'load'});
  await page.waitForTimeout(8500);
  out.savedPage = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const rows=[...document.querySelectorAll('[data-message-id]')];
    const last=rows[rows.length-1];
    return {n:rows.length, lastLines: last? last.innerText.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,10):null,
      lastButtons: last? [...last.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)).filter(Boolean):null};
  });
  return out;
};
