export default async ({page}) => await page.evaluate(async () => {
  const devs = (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput');
  const a = await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:devs[0].deviceId}}});
  const pc = new RTCPeerConnection();
  const sender = pc.addTrack(a.getAudioTracks()[0], a);
  const before = {label: sender.track.label, dev:(sender.track.getSettings().deviceId||'').slice(0,10)};
  // now swap to a different device, exactly as an app would
  const b = await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:devs[2].deviceId}}});
  await sender.replaceTrack(b.getAudioTracks()[0]);
  const after = {label: sender.track.label, dev:(sender.track.getSettings().deviceId||'').slice(0,10)};
  // and read it back the same way the earlier test did
  const viaGetSenders = pc.getSenders().filter(s=>s.track).map(s=>s.track.label);
  pc.close(); a.getTracks().forEach(t=>t.stop()); b.getTracks().forEach(t=>t.stop());
  return {before, after, viaGetSenders, instrumentReflectsSwap: after.label !== before.label};
});
