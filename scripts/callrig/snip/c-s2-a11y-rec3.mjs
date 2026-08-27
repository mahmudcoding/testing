const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.addInitScript(() => {
    window.__ann = [];
    const start = () => {
      if (!document.body) return setTimeout(start, 30);
      const mo = new MutationObserver(() => {
        for (const e of document.querySelectorAll('[role="status"],[role="alert"],[aria-live]')) {
          const t=(e.textContent||'').trim(); if(!t) continue;
          const key=t; if (!window.__ann.some(a=>a.key===key))
            window.__ann.push({key, text:t.slice(0,140), t:Math.round(performance.now()), sr:/sr-only/.test(e.className||'')});
        }
      });
      mo.observe(document.body,{subtree:true,childList:true,characterData:true});
    };
    start();
  });
  // start in qa-private, then switch to qa-general (the state where I saw the raw id)
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(4500);
  await page.locator(`a[href*="${GEN}"]`).first().click({timeout:8000});
  await page.waitForTimeout(1500);
  return await page.evaluate(()=>({ready:true, url:location.href, seen:window.__ann.length}));
};
