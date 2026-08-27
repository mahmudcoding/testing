// Control: can the BROWSER honour an exact deviceId for these devices at all?
export default async ({page}) => await page.evaluate(async ()=>{
  const devs = (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput')
    .map(d=>({id:d.deviceId.slice(0,10), label:d.label}));
  const out = {devices: devs, tries: []};
  for (const d of (await navigator.mediaDevices.enumerateDevices()).filter(x=>x.kind==='audioinput')) {
    try {
      const s = await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:d.deviceId}}});
      const t = s.getAudioTracks()[0]; const st = t.getSettings();
      out.tries.push({asked:d.label, got:t.label, gotId:String(st.deviceId||'').slice(0,10), askedId:d.deviceId.slice(0,10)});
      s.getTracks().forEach(x=>x.stop());
    } catch(e) { out.tries.push({asked:d.label, err:String(e).slice(0,60)}); }
  }
  return out;
});
