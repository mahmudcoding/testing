export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  out.pinnedBefore=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return {status:r.status, total:j.total, n:(j.messages||[]).length,
      bodies:(j.messages||[]).map(m=>(m.body||'').slice(0,20))};}, ch);
  out.made=await page.evaluate(async(ch)=>{
    const txts=['QA-S2-PIN-alpha','QA-S2-PIN-beta','QA-S2-PIN-gamma','QA-S2-PIN-delta'];
    const r=[];
    for(const t of txts){
      const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:ch, body:t, idempotency_key:'qap-'+Math.random().toString(36).slice(2)})});
      const j=await p.json();
      const q=await fetch(`/api/v1/messaging/channels/${ch}/messages/${j.id}/pin`,
        {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
         body:JSON.stringify({pin:true})});
      r.push({t, post:p.status, pin:q.status});
    }
    return r;}, ch);
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  out.pinnedAfter=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return {status:r.status, total:j.total, n:(j.messages||[]).length};}, ch);
  out.bannerControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    return [...m.querySelectorAll('button,[role="button"]')]
      .filter(e=>/view all|pinned/i.test((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')))
      .map(e=>{const r=e.getBoundingClientRect();
        const hit=document.elementFromPoint(Math.round(r.left+r.width/2),Math.round(r.top+r.height/2));
        return {t:(e.innerText||'').replace(/\s+/g,' ').slice(0,30), al:e.getAttribute('aria-label'),
          y:Math.round(r.top), visible:v(e), clickable:!!(hit&&(hit===e||e.contains(hit)))};});});
  return out;
};
