const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.archive = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/archive`,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'}, body:'{}'});
    return {s:r.status, b:(await r.text()).slice(0,120)};
  }, CH);
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.view = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    return {url:location.href, composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      msgs: document.querySelectorAll('[data-message-id]').length,
      headerButtons:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(0,12)};
  });
  if (out.view.msgs) {
    const row = page.locator('[data-message-id]').last();
    await row.scrollIntoViewIfNeeded().catch(()=>{});
    await row.hover(); await page.waitForTimeout(900);
    out.rowButtons = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      return [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean);
    });
    try {
      await row.locator('button[aria-label="More actions"]').first().click({timeout:8000});
      await page.waitForTimeout(1300);
      out.menu = await page.evaluate(()=>{
        const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
        const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
        return p? [...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean):null;
      });
      await page.keyboard.press('Escape');
    } catch(e){ out.menuErr=String(e).slice(0,70); }
  }
  // try posting into the archived channel via API (UI has no composer)
  out.postAttempt = await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-ARCHIVED-POST'})});
    return {s:r.status, b:(await r.text()).slice(0,160)};
  }, CH);
  return out;
};
