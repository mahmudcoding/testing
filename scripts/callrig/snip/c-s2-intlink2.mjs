const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(8500);
  return await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].filter(e=>/INTLINK-TARGET/.test(e.innerText||'')).pop();
    if(!el) return {err:'not found'};
    return {lines: el.innerText.split('\n').map(s=>s.trim()).filter(Boolean),
      hasRawId: /U4Q[A-Z0-9]{8,}/.test(el.innerText),
      buttons:[...el.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,34)).filter(Boolean)};
  });
};
