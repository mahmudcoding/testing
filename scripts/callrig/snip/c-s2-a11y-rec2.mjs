const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.addInitScript(() => {
    window.__ann = [];
    const start = () => {
      if (!document.body) return setTimeout(start, 50);
      const mo = new MutationObserver(() => {
        const nodes=[...document.querySelectorAll('[role="status"],[role="alert"],[aria-live]')];
        for (const e of nodes) {
          const t=(e.textContent||'').trim();
          if (!t) continue;
          const sr=/sr-only/.test(e.className||'');
          const r=e.getBoundingClientRect();
          const key=t+'|'+sr;
          if (!window.__ann.some(a=>a.key===key)) window.__ann.push({key, text:t.slice(0,140), sr,
            w:Math.round(r.width), h:Math.round(r.height), t:Math.round(performance.now())});
        }
      });
      mo.observe(document.body,{subtree:true,childList:true,characterData:true});
    };
    start();
  });
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>({ready:true, seen:window.__ann.length, vis:document.visibilityState}));
};
