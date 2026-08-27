export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001';
  const out={};
  const TXT='QA-S2-OFFLINE-'+Math.random().toString(36).slice(2,6);
  out.text=TXT;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  const snap=()=>page.evaluate((TXT)=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const mine=els.filter(e=>(e.innerText||'').includes(TXT));
    const toasts=[...document.querySelectorAll('[data-sonner-toast],[role="alert"],[role="status"]')]
      .filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60)).filter(Boolean);
    const marks=mine.map(e=>{
      const t=(e.innerText||'').replace(/\s+/g,' ');
      const btns=[...e.querySelectorAll('button,[role="button"]')].filter(v)
        .map(b=>b.getAttribute('aria-label')||b.innerText.trim()).filter(Boolean);
      return {tail:t.slice(-46), opacity:+getComputedStyle(e).opacity, btns};});
    return {composer:(comp&&comp.innerText.trim())||'', inFeed:mine.length, marks,
      toasts:[...new Set(toasts)], total:els.length};
  }, TXT);
  out.beforeOffline=await snap();
  await ctx.setOffline(true);
  await page.waitForTimeout(1500);
  await comp.click();
  await comp.type(TXT, {delay:40});
  await page.waitForTimeout(600);
  out.typed=await snap();
  await page.keyboard.press('Enter');
  const series=[];
  for(let i=0;i<12;i++){ await page.waitForTimeout(1000); series.push(await snap()); }
  const key=(s)=>JSON.stringify([s.composer,s.inFeed,s.toasts,s.marks]);
  const ch=[]; let prev=null; for(const s of series){ if(key(s)!==prev){ch.push(s); prev=key(s);} }
  out.whileOffline={changes:ch.slice(0,6), final:series[series.length-1]};
  await ctx.setOffline(false);
  const series2=[];
  for(let i=0;i<20;i++){ await page.waitForTimeout(1000); series2.push(await snap()); }
  const ch2=[]; prev=null; for(const s of series2){ if(key(s)!==prev){ch2.push(s); prev=key(s);} }
  out.afterOnline={changes:ch2.slice(0,6), final:series2[series2.length-1]};
  out.onServer=await page.evaluate(async({gen,TXT})=>{
    const r=await fetch(`/api/v1/messaging/channels/${gen}/messages?limit=30`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.messages||[]).some(m=>(m.body||'').includes(TXT));
  },{gen,TXT});
  return out;
};
