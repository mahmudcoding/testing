export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  // park OUTSIDE the channel so unread can accumulate
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(7000);
  // mute the target channel via the API with the documented body
  out.mute=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({duration_seconds:3600})});
    return {status:r.status, body:(await r.text()).slice(0,40)};}, ch);
  // seed the local store too, so the UI considers it muted
  await page.evaluate((ch)=>{
    const k='aloqa.channel.mute';
    const v=JSON.parse(localStorage.getItem(k)||'{"state":{"mutedByChannel":{}},"version":1}');
    v.state.mutedByChannel[ch]=Date.now()+3600000;
    localStorage.setItem(k, JSON.stringify(v));}, ch);
  await page.reload(); await page.waitForTimeout(7000);
  out.mutedInUi=await page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')).slice(0,110));
  await page.evaluate((ch)=>{
    window.__bg={s:[],t0:Date.now()};
    clearInterval(window.__bgId);
    window.__bgId=setInterval(()=>{
      const a=[...document.querySelectorAll(`a[href*="${ch}"]`)]
        .filter(x=>x.getBoundingClientRect().height>0)[0];
      window.__bg.s.push({t:Math.round((Date.now()-window.__bg.t0)/1000),
        badge:a?(a.innerText||'').replace(/\s+/g,' ').slice(0,26):null,
        vis:document.visibilityState});
    },1500);}, ch);
  return out;
};
