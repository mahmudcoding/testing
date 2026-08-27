const readMic = async (page) => page.evaluate(async () => {
  const devs = await navigator.mediaDevices.enumerateDevices();
  const inputs = Object.fromEntries(devs.filter(d=>d.kind==='audioinput').map(d=>[d.deviceId, d.label]));
  const out = [];
  for (const pc of (window.__pcs||[])) {
    if (pc.connectionState === 'closed') continue;
    for (const s of pc.getSenders()) {
      if (s.track && s.track.kind === 'audio') {
        const st = s.track.getSettings();
        out.push({trackLabel: s.track.label, deviceId:(st.deviceId||'').slice(0,12), inputLabelForId: inputs[st.deviceId]||null, groupId:(st.groupId||'').slice(0,8)});
      }
    }
  }
  const gum = (window.__gumCalls||[]).slice(-4).map(g=>g.c.slice(0,180));
  return {senders: out, lastGum: gum};
});

const pick = async (page, name) => {
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(1400);
  const ok = await page.evaluate((n)=>{
    const b=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).find(e=>(e.textContent||'').startsWith(n));
    if(!b) return false; b.click(); return true;
  }, name);
  await page.waitForTimeout(4500);
  return ok;
};

export default async ({page}) => {
  const out={};
  out.t0 = await readMic(page);
  out.picked1 = await pick(page, 'Fake Audio Input 1');
  out.t1 = await readMic(page);
  out.picked2 = await pick(page, 'Fake Audio Input 2');
  out.t2 = await readMic(page);
  out.pickedDefault = await pick(page, 'Fake Default Audio Input');
  out.t3 = await readMic(page);
  out.picked1again = await pick(page, 'Fake Audio Input 1');
  out.t4 = await readMic(page);
  return out;
};
