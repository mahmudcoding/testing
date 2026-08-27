const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  const out={};
  // archive a DIFFERENT channel (this one has 1 message), then repeat both checks
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.archive = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/archive`,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'}, body:'{}'});
    return {s:r.status, b:(await r.text()).slice(0,90)};
  }, CH);
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET')
    resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,50)}); });
  out.state = await page.evaluate(()=>({composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
    msgs:document.querySelectorAll('[data-message-id]').length}));
  // post attempt
  out.post = await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify({channel_id:ch, body:'QA-S2-ARCH2'})});
    return {s:r.status, key:(await r.text()).match(/"key":"[A-Z_]+"/)?.[0]||null};
  }, CH);
  if (out.state.msgs) {
    const row = page.locator('[data-message-id]').last();
    await row.scrollIntoViewIfNeeded().catch(()=>{});
    await row.hover(); await page.waitForTimeout(900);
    // reaction
    await row.locator('button[aria-label="Add reaction"]').first().click({timeout:10000});
    await page.waitForTimeout(1800);
    try { await page.locator('input[aria-label="Search emoji"]').last().fill('star'); await page.waitForTimeout(1300);
          await page.locator('button[aria-label="Star"]').last().click({timeout:8000}); out.reacted=true; }
    catch(e){ out.reactErr=String(e).slice(0,60); }
    await page.waitForTimeout(2500); await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    // Edit — should be a dead control
    await row.hover(); await page.waitForTimeout(800);
    await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
    await page.waitForTimeout(1300);
    const before = await page.evaluate(()=>({menus:[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}).length}));
    await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Edit$/}).last().click({timeout:8000});
    await page.waitForTimeout(3000);
    out.editAttempt = await page.evaluate((b)=>({menusBefore:b.menus,
      menusAfter:[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}).length,
      editing:/Editing message/.test(document.body.innerText),
      composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')}), before);
  }
  out.resp = resp;
  out.persisted = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    return {reactions:JSON.stringify(m.reactions||[]).slice(0,90), pinned:m.pinned};
  }, CH);
  return out;
};
