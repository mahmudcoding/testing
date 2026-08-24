export default async ({page}) => {
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
  return await page.evaluate(async () => {
    const out = {};
    try {
      const s = await navigator.mediaDevices.getUserMedia({audio:true, video:true});
      out.gum = s.getTracks().map(t => `${t.kind}:${t.label}:${t.readyState}`);
      const vt = s.getVideoTracks()[0];
      out.videoSettings = vt ? vt.getSettings() : null;
      s.getTracks().forEach(t => t.stop());
    } catch (e) { out.gum = 'ERR ' + e.name + ' ' + e.message; }
    out.devices = (await navigator.mediaDevices.enumerateDevices()).map(d => d.kind + '|' + d.label);
    out.url = location.href;
    return out;
  });
};
