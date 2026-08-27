export default async ({page}) => page.evaluate(async () => {
  const devs=await navigator.mediaDevices.enumerateDevices();
  const cams=devs.filter(d=>d.kind==='videoinput').map(d=>({id:d.deviceId.slice(0,10),label:d.label}));
  const senders=[];
  for(const pc of (window.__pcs||[])) for(const s of pc.getSenders())
    if(s.track&&s.track.kind==='video'){const st=s.track.getSettings();
      senders.push({deviceId:(st.deviceId||'?').slice(0,12), label:s.track.label});}
  return {cams, senders};
});
