export default async ({page}) => page.evaluate(async () => {
  const devs = await navigator.mediaDevices.enumerateDevices();
  const byId = Object.fromEntries(devs.map(d=>[d.deviceId, d.label]));
  const out = [];
  for (const pc of (window.__pcs||[])) {
    for (const s of pc.getSenders()) {
      if (s.track && s.track.kind === 'audio') {
        const st = s.track.getSettings();
        out.push({kind:'sender-audio', deviceId:(st.deviceId||'').slice(0,8),
                  label: byId[st.deviceId] || '(unknown)', enabled:s.track.enabled, state:s.track.readyState});
      }
    }
  }
  return {activeAudio: out, deviceCount: devs.length};
});
