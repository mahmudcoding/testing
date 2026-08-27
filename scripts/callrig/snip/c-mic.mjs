const readMic = async (page) => page.evaluate(async () => {
  const devs = await navigator.mediaDevices.enumerateDevices();
  const byId = Object.fromEntries(devs.map(d=>[d.deviceId, d.label]));
  const out = [];
  for (const pc of (window.__pcs||[])) {
    if (pc.connectionState === 'closed') continue;
    for (const s of pc.getSenders()) {
      if (s.track && s.track.kind === 'audio') {
        const st = s.track.getSettings();
        out.push({label: s.track.label, id:(st.deviceId||'').slice(0,20), resolvedLabel: byId[st.deviceId]||null, enabled:s.track.enabled, state:s.track.readyState});
      }
    }
  }
  return out;
});

export default async ({page}) => {
  const out = {};
  out.before = await readMic(page);
  // open the mic menu
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(1500);
  out.menu = await page.evaluate(()=>{
    const items=[...document.querySelectorAll('[role="menuitem"],[role="menuitemradio"],[role="option"]')].filter(e=>e.getClientRects().length);
    return items.map(e=>({txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40), role:e.getAttribute('role'),
      pressed:e.getAttribute('aria-pressed'), checked:e.getAttribute('aria-checked'), sel:e.getAttribute('data-selected'),
      bg:getComputedStyle(e).backgroundColor, fw:getComputedStyle(e).fontWeight,
      hasSvg: e.querySelectorAll('svg').length}));
  });
  // pick "Fake Audio Input 1"
  const pick = async (name) => {
    const ok = await page.evaluate((n)=>{
      const items=[...document.querySelectorAll('[role="menuitem"],[role="menuitemradio"],[role="option"]')].filter(e=>e.getClientRects().length);
      const it = items.find(e=>(e.textContent||'').includes(n));
      if(!it) return false; it.click(); return true;
    }, name);
    await page.waitForTimeout(4000);
    return ok;
  };
  out.pick1 = await pick(process.env.QA_MIC1 || 'Fake Audio Input 1');
  out.afterPick1 = await readMic(page);
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(1200);
  out.menuAfter1 = await page.evaluate(()=>{
    const items=[...document.querySelectorAll('[role="menuitem"],[role="menuitemradio"],[role="option"]')].filter(e=>e.getClientRects().length);
    return items.map(e=>({txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40), checked:e.getAttribute('aria-checked'), sel:e.getAttribute('data-selected'), bg:getComputedStyle(e).backgroundColor, hasSvg:e.querySelectorAll('svg').length}));
  });
  out.pick2 = await pick(process.env.QA_MIC2 || 'Fake Audio Input 2');
  out.afterPick2 = await readMic(page);
  return out;
};
