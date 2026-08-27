export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const state=()=>page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Mute notifications"], button[aria-label="Unmute notifications"]');
    let ls=null; try{ ls=localStorage.getItem('aloqa.channel.mute'); }catch(e){}
    return {label:b?b.getAttribute('aria-label'):null, pressed:b?b.getAttribute('aria-pressed'):null,
      localStorage: ls? ls.slice(0,90):null};});
  out.before=await state();
  // mute through the UI
  const btn=page.locator('button[aria-label="Mute notifications"]').first();
  out.muteBtnFound=await btn.count();
  if(out.muteBtnFound){
    await btn.click(); await page.waitForTimeout(1500);
    const hour=page.getByText(/For 1 hour/).first();
    out.menuItemFound=await hour.count();
    if(out.menuItemFound){ await hour.click(); await page.waitForTimeout(3000); }
  }
  out.afterMute=await state();
  // what the server thinks
  out.serverAfterMute=await page.evaluate(async(ch)=>{
    for(const u of [`/api/v1/notifications/channels/${ch}/mute`, `/api/v1/notifications/settings`]){
      const r=await fetch(u,{credentials:'include'});
      if(r.status!==404){ const t=await r.text();
        return {url:u.replace(ch,'<ch>'), status:r.status, hasChannel:t.includes(ch), body:t.slice(0,130)}; }
    }
    return 'both 404';}, ch);
  // simulate a second device: drop the local key, reload, and see what the button says
  await page.evaluate(()=>{ try{ localStorage.removeItem('aloqa.channel.mute'); }catch(e){} });
  await page.reload(); await page.waitForTimeout(10000);
  out.afterClearingLocalKey=await state();
  out.PASS = out.afterMute.label==='Unmute notifications'
             && !!out.afterMute.localStorage
             && out.afterClearingLocalKey.label==='Mute notifications';
  return out;
};
