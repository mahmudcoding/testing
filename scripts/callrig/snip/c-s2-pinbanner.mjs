export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', mid='M4OX0TTPGJCFW4G';
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  out.pin=await page.evaluate(async(mid)=>{
    const r=await fetch(`/api/v1/messaging/messages/${mid}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({pin:true})});
    return {status:r.status, body:(await r.text()).slice(0,140)};}, mid);
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const vis=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3||r.top>300) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Pinned');
    return {pinnedText: i>=0? t.slice(i,i+64):null,
      controls:[...m.querySelectorAll('button,a,[role="button"]')].filter(v).map(e=>{
        const r=e.getBoundingClientRect();
        const hit=document.elementFromPoint(Math.round(r.left+r.width/2),Math.round(r.top+r.height/2));
        return {t:(e.innerText||'').replace(/\s+/g,' ').slice(0,26), al:e.getAttribute('aria-label'),
          y:Math.round(r.top), ok:!!(hit&&(hit===e||e.contains(hit)))};})};});
  out.afterPin=await vis();
  const va=page.locator('main button, main [role="button"]').filter({hasText:/View all/i}).first();
  if(await va.count()){
    const r=await va.evaluate(e=>{const b=e.getBoundingClientRect();
      const h=document.elementFromPoint(Math.round(b.left+b.width/2),Math.round(b.top+b.height/2));
      return {ok:!!(h&&(h===e||e.contains(h))), txt:e.innerText};});
    out.viewAllHit=r;
    if(r.ok){ await va.click(); await page.waitForTimeout(2500);
      out.panel=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(v)
          .sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
        return d? {head:(d.innerText||'').replace(/\s+/g,' ').slice(0,80),
          entries:[...d.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')).slice(0,5),
          btns:[...d.querySelectorAll('button,[role="button"]')].filter(v)
            .map(e=>(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,24)).slice(0,10)}:'none';});
    }
  }
  return out;
};
