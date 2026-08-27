const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const send = async (text, label) => {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.evaluate((t)=>{const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
      c.focus(); document.execCommand('insertText', false, t);}, text);
    await page.waitForTimeout(900);
    await page.keyboard.press('Enter'); await page.waitForTimeout(3200);
    return await page.evaluate((lbl)=>{
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      const body=[...el.querySelectorAll('*')].filter(e=>e.children.length===0 && (e.textContent||'').length>3).pop();
      const r=el.getBoundingClientRect();
      return {label:lbl, text:el.innerText.replace(/\n+/g,' | ').slice(0,90),
        dir: body? getComputedStyle(body).direction : null,
        dirAttr: body? (body.closest('[dir]')||{}).getAttribute?.('dir') : null,
        rect:{w:Math.round(r.width), right:Math.round(r.right)}, viewport:innerWidth,
        pageOverflow: document.documentElement.scrollWidth>document.documentElement.clientWidth};
    }, label);
  };
  out.arabic = await send('QA-S2-RTL مرحبا بالعالم هذا اختبار', 'arabic-mixed');
  out.hebrew = await send('שלום עולם QA-S2-RTL2', 'hebrew-mixed');
  out.cyrillic = await send('QA-S2-CYR Привет мир — тест', 'cyrillic');
  out.zerowidth = await send('QA-S2-ZW a​b‍c⁠d', 'zero-width');
  return out;
};
