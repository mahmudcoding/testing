export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', mid='M4OX0TTPGJCFW4G';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  out.pin=await page.evaluate(async({ch,mid})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,
      {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
       body:JSON.stringify({pin:true})});
    const b=(await r.text()).slice(0,160);
    const p=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const pj=await p.text();
    return {pinStatus:r.status, pinBody:b, pinnedListStatus:p.status,
      pinnedListHasTarget: pj.includes(mid), pinnedListSnippet: pj.slice(0,150)};
  }, {ch,mid});
  // fresh load, then look for the real (visible) pinned banner
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  out.banner=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3||r.top>320) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    return {controls:[...m.querySelectorAll('button,a,[role="button"]')].filter(v)
      .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').slice(0,26), al:e.getAttribute('aria-label'),
        y:Math.round(e.getBoundingClientRect().top)}))
      .filter(x=>/pin|view all/i.test((x.t||'')+' '+(x.al||'')))};});
  const va=page.locator('main button, main [role="button"]').filter({hasText:/View all/i}).first();
  if(await va.count()){
    const hit=await va.evaluate(e=>{const b=e.getBoundingClientRect();
      const h=document.elementFromPoint(Math.round(b.left+b.width/2),Math.round(b.top+b.height/2));
      return {ok:!!(h&&(h===e||e.contains(h))), txt:e.innerText.replace(/\s+/g,' ')};});
    out.viewAll=hit;
    if(hit.ok){
      await va.click(); await page.waitForTimeout(2500);
      out.panel=await page.evaluate((mid)=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(v)
          .sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
        if(!d) return 'none';
        return {head:(d.innerText||'').replace(/\s+/g,' ').slice(0,90),
          hasTarget: !!d.querySelector(`[data-message-id="${mid}"]`),
          btns:[...d.querySelectorAll('button,[role="button"]')].filter(v)
            .map(e=>(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,26)).slice(0,12)};}, mid);
      // click the pinned entry / its jump control
      const entry=page.locator(`[role="dialog"] [data-message-id="${mid}"], aside [data-message-id="${mid}"]`).first();
      if(await entry.count()){
        await entry.click();
        const marks=[];
        for(let i=0;i<18;i++){
          await page.waitForTimeout(1000);
          marks.push(await page.evaluate((mid)=>{
            const el=document.querySelector(`main [data-message-id="${mid}"]`);
            const loaded=document.querySelectorAll('main [data-message-id]').length;
            if(!el) return {loaded, present:false};
            const r=el.getBoundingClientRect();
            return {loaded, present:true, top:Math.round(r.top), inView:r.top>=-4&&r.bottom<=innerHeight+4};
          }, mid));
          const l=marks[marks.length-1]; if(l.present&&l.inView&&i>=2) break;
        }
        out.jump={final:marks[marks.length-1], waited:marks.length,
          everPresent:marks.some(m=>m.present), everInView:marks.some(m=>m.inView)};
      } else out.jump='entry not found in panel';
    }
  } else out.viewAll='no View all control';
  return out;
};
