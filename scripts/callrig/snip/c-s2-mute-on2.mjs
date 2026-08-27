export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  if (!page.url().includes('/c/'+ch)) { await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(3000); }
  const r=await page.evaluate(async(ch)=>{
    const res=await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'POST',credentials:'include'});
    let txt=''; try{txt=(await res.text()).slice(0,150);}catch(e){}
    const j=await (await fetch('/api/v1/notifications?limit=3',{credentials:'include'})).json();
    const arr=j.notifications||j.data||j||[];
    return {muteStatus:res.status, muteBody:txt, total:j.total??arr.length};
  }, ch);
  // confirm from the UI
  const btn=page.locator('button[aria-label*="ute notification"]');
  r.uiBtn = await btn.count() ? await btn.first().getAttribute('aria-label') : 'none';
  r.pressed = await btn.count() ? await btn.first().getAttribute('aria-pressed') : null;
  r.url=page.url();
  return r;
};
