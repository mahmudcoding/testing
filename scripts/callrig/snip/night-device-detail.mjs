export default async ({page}) => page.evaluate(async () => {
  const devs = await navigator.mediaDevices.enumerateDevices();
  const ins = devs.filter(d=>d.kind==='audioinput').map(d=>({id:d.deviceId.slice(0,10), label:d.label}));
  const outs = devs.filter(d=>d.kind==='audiooutput').map(d=>({id:d.deviceId.slice(0,10), label:d.label}));
  const senders = [];
  for (const pc of (window.__pcs||[])) {
    for (const s of pc.getSenders()) {
      if (s.track && s.track.kind==='audio') {
        const st=s.track.getSettings();
        senders.push({deviceId:(st.deviceId||'?'), groupId:(st.groupId||'?').slice(0,8), label:s.track.label});
      }
    }
  }
  return {audioInputs:ins, audioOutputs:outs, senders};
});
