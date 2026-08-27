export default async ({page}) => page.evaluate(async () => {
  const devs=await navigator.mediaDevices.enumerateDevices();
  const byId=Object.fromEntries(devs.filter(d=>d.kind==='audioinput').map(d=>[d.deviceId,d.label]));
  const senders=[];
  for(const pc of (window.__pcs||[])) for(const s of pc.getSenders())
    if(s.track&&s.track.kind==='audio'){const st=s.track.getSettings();
      senders.push({deviceId:st.deviceId, label:s.track.label});}
  const ls={};
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);
    if(/device|audio|call/i.test(k)) ls[k]=localStorage.getItem(k).slice(0,180);}
  return {senders, localStorage:ls};
});
