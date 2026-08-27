export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001';
  const out={};
  const TXT='QA-S2-OFFL2-'+Math.random().toString(36).slice(2,6);
  out.text=TXT;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  const uiHas=()=>page.evaluate((TXT)=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const mine=els.filter(e=>(e.innerText||'').includes(TXT));
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {n:mine.length, opacity:mine[0]?+getComputedStyle(mine[0]).opacity:null,
      btns:mine[0]?[...mine[0].querySelectorAll('button,[role="button"]')].filter(v)
        .map(b=>b.getAttribute('aria-label')||b.innerText.trim()).filter(Boolean):[],
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,44))};}, TXT);
  const srvHas=()=>page.evaluate(async({gen,TXT})=>{
    const r=await fetch(`/api/v1/messaging/channels/${gen}/messages?limit=100`,{credentials:'include'});
    if(!r.ok) return {err:r.status};
    const j=await r.json().catch(()=>({}));
    return {found:(j.messages||[]).some(m=>(m.body||'').includes(TXT)), scanned:(j.messages||[]).length};
  },{gen,TXT});
  await ctx.setOffline(true);
  await page.waitForTimeout(1500);
  await comp.click(); await comp.type(TXT,{delay:40}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  out.offlineUI=await uiHas();
  await ctx.setOffline(false);
  // poll the server for 90 s
  const timeline=[];
  for(let i=0;i<18;i++){
    await page.waitForTimeout(5000);
    const s=await srvHas(); const u=await uiHas();
    timeline.push({t:(i+1)*5, srv:s.found===true, ui:u.n, toasts:u.toasts});
    if(s.found) break;
  }
  out.pollAfterOnline={lastAt:timeline[timeline.length-1].t,
    everOnServer:timeline.some(x=>x.srv),
    changes:(()=>{const k=(x)=>JSON.stringify([x.srv,x.ui,x.toasts]);const o=[];let p=null;
      for(const x of timeline){if(k(x)!==p){o.push(x);p=k(x);}}return o.slice(0,6);})()};
  out.uiBeforeReload=await uiHas();
  // decisive: reload and see whether it survives
  await page.reload(); await page.waitForTimeout(10000);
  out.uiAfterReload=await uiHas();
  out.serverAfterReload=await srvHas();
  return out;
};
