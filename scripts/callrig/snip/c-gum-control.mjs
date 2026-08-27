export default async ({page}) => {
  return await page.evaluate(async () => {
    const devs = (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput');
    const res=[];
    for (const d of devs) {
      for (const mode of ['plain','exact']) {
        try {
          const c = mode==='exact' ? {audio:{deviceId:{exact:d.deviceId}}} : {audio:{deviceId:d.deviceId}};
          const s = await navigator.mediaDevices.getUserMedia(c);
          const t = s.getAudioTracks()[0]; const st = t.getSettings();
          res.push({asked:d.label, askedId:d.deviceId.slice(0,8), mode, gotLabel:t.label, gotId:(st.deviceId||'').slice(0,8), gotGroup:(st.groupId||'').slice(0,8)});
          s.getTracks().forEach(x=>x.stop());
        } catch(e) { res.push({asked:d.label, mode, err:String(e).slice(0,60)}); }
      }
    }
    return res;
  });
};
