const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const reqs=[];
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\//.test(u) && r.method()!=='GET')
      reqs.push({m:r.method(), u:u.split('/api/v1')[1].slice(0,52), post:(r.postData()||'').slice(0,170)}); });
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.evaluate(()=>{const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    c.focus(); document.execCommand('insertText', false, '- QA-S2-EEREQ item');});
  await page.waitForTimeout(900);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
  reqs.length=0;
  const row = page.locator('[data-message-id]').last();
  await row.hover(); await page.waitForTimeout(900);
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Edit$/}).last().click({timeout:8000});
  await page.waitForTimeout(2200);
  out.editFieldBefore = await page.evaluate(()=>{
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {text:JSON.stringify(c.innerText), html:c.innerHTML.slice(0,220)};
  });
  await page.keyboard.type(' Z'); await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(4000);
  out.editRequests = reqs;
  out.after = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {body:JSON.stringify(m.body||''), lists: el? el.querySelectorAll('ul,ol,li').length:0,
      domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,70):null};
  });
  return out;
};
