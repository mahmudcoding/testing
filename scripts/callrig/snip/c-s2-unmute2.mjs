export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={reqs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.method()!=='GET')
      out.reqs.push(r.method()+' '+u.replace(/^https?:\/\/[^/]+\/api\/v1/,'').slice(0,64)); });
  const openMenu=async()=>{ const b=page.locator('button[aria-label="Channel details"],button[aria-label="More actions"]').last();
    await b.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(1400); };
  // 1. mute
  let mute=page.locator('button,[role="menuitem"]').filter({hasText:/^Mute notifications$/}).first();
  if(!await mute.count()){ await openMenu();
    mute=page.locator('button,[role="menuitem"]').filter({hasText:/^Mute notifications$/}).first(); }
  out.muteFound=await mute.count();
  if(out.muteFound){ await mute.click(); await page.waitForTimeout(1500);
    const opt=page.locator('[role="menuitem"],[role="dialog"] button').filter({hasText:/For 1 hour/i}).first();
    out.optFound=await opt.count();
    if(out.optFound){ await opt.click(); await page.waitForTimeout(3500); } }
  out.afterMuteReqs=[...out.reqs];
  // 2. read the unmute control and its state
  const un=page.locator('button,[role="menuitem"]').filter({hasText:/^Unmute notifications$/}).first();
  if(!await un.count()) await openMenu();
  const un2=page.locator('button,[role="menuitem"]').filter({hasText:/^Unmute notifications$/}).first();
  out.unmuteFound=await un2.count();
  if(out.unmuteFound){
    out.unmuteAria=await un2.evaluate(e=>e.getAttribute('aria-pressed'));
    await un2.evaluate(e=>{ window.__clicked=0;
      e.addEventListener('click',()=>{window.__clicked++;},{capture:true}); });
    out.reqs.length=0;
    await un2.click(); await page.waitForTimeout(4000);
    out.clickLanded=await page.evaluate(()=>window.__clicked||0);
    out.reqsAfterUnmute=[...out.reqs];
    out.labelNow=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
      return [...document.querySelectorAll('button,[role="menuitem"]')].filter(v)
        .map(e=>(e.textContent||'').trim()).filter(t=>/^(Un)?[Mm]ute/.test(t)).slice(0,3);});
  }
  // 3. server truth
  out.serverMuted=await page.evaluate(async (ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
    const j=await r.json(); const a=j.channels||j.data||j;
    const c=(Array.isArray(a)?a:[]).find(x=>x.id==='C4QCPRIVATE0001');
    return c?{muted:c.muted??c.is_muted??c.muted_until??null}:{no:true};}, ws);
  return out;
};
