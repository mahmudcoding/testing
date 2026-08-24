export default async ({page}) => {
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1500);
  return await page.evaluate(async () => {
    const devs = (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput');
    const out = [];
    for (const d of devs) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:d.deviceId}}});
        const t = s.getAudioTracks()[0];
        out.push({
          requestedLabel: d.label,
          requestedId: d.deviceId.slice(0,12),
          gotLabel: t.label,
          gotDeviceId: (t.getSettings().deviceId||'').slice(0,12),
          trackId: t.id.slice(0,8)
        });
        s.getTracks().forEach(x=>x.stop());
      } catch(e) { out.push({requestedLabel:d.label, error:e.name}); }
    }
    return out;
  });
};
