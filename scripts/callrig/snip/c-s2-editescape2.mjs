const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const reqs=[];
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\/messaging\/messages/.test(u) && ['POST','PATCH','PUT'].includes(r.method()))
      reqs.push({m:r.method(), u:u.split('/api/v1')[1].slice(0,46), post:(r.postData()||'').slice(0,180)}); });
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const read = (t) => page.evaluate(async (tag)=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {tag, body:JSON.stringify(m.body||''),
      domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,90):null,
      lists: el? el.querySelectorAll('ul,ol,li').length:0,
      quotes: el? el.querySelectorAll('blockquote').length:0,
      headings: el? el.querySelectorAll('h1,h2,h3').length:0};
  }, t);
  const cycle = async (text, label) => {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.evaluate((t)=>{const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
      c.focus(); document.execCommand('insertText', false, t);}, text);
    await page.waitForTimeout(900);
    await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
    const before = await read(label+'-sent');
    const row = page.locator('[data-message-id]').last();
    await row.hover(); await page.waitForTimeout(900);
    await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
    await page.waitForTimeout(1200);
    await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Edit$/}).last().click({timeout:8000});
    await page.waitForTimeout(2200);
    await page.keyboard.type(' Z'); await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(3800);
    const after = await read(label+'-edited');
    return {before, after};
  };
  out.hyphen = await cycle('- QA-S2-EE1 item', 'hyphen');
  out.hash   = await cycle('# QA-S2-EE2 heading', 'hash');
  out.quote  = await cycle('> QA-S2-EE3 quoted', 'quote');
  out.requests = reqs;
  return out;
};
