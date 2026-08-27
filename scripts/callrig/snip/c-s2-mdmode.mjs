const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const read = (t) => page.evaluate(async (tag)=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {tag, body:JSON.stringify(m.body||''),
      domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,80):null,
      strong: el? el.querySelectorAll('strong,b').length:0,
      em: el? el.querySelectorAll('em,i').length:0,
      code: el? el.querySelectorAll('code').length:0,
      lists: el? el.querySelectorAll('ul,ol,li').length:0};
  }, t);
  // A: markdown mode OFF (default) — typed markdown should stay literal
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.evaluate(()=>{const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    c.focus(); document.execCommand('insertText', false, 'QA-S2-MD-OFF **bold** _it_ `c`');});
  await page.waitForTimeout(900);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
  out.mdOff = await read('md-off');
  // B: markdown mode ON via the toggle, then type the same
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.locator('button[aria-label="Markdown formatting"]').last().click({timeout:8000});
  await page.waitForTimeout(1200);
  out.toggleState = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button[aria-label="Markdown formatting"]')].pop();
    return {pressed:b.getAttribute('aria-pressed')};
  });
  await page.evaluate(()=>{const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    c.focus(); document.execCommand('insertText', false, 'QA-S2-MD-ON **bold** _it_ `c`');});
  await page.waitForTimeout(1200);
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(3500);
  out.mdOn = await read('md-on');
  return out;
};
