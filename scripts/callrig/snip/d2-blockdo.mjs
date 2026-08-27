export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .find(e=>(e.getAttribute('aria-label')||'')==="Open QA Bob's profile");
    if(el) el.click();
  });
  await page.waitForTimeout(2200);
  // start polling BEFORE the click
  await page.evaluate(() => {
    window.__notices=[];
    window.__t=setInterval(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();
        if(!(r.width>0&&r.height>0)) return false;
        let n=e,o=1; while(n){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
        return o>0.05;};
      for (const e of document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast],[role=dialog]')) {
        if(!vis(e)) continue;
        const t=(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,90);
        if(t && !window.__notices.includes(t)) window.__notices.push(t);
      }
    },250);
  });
  const clicked = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>((x.getAttribute('aria-label')||x.innerText||'').trim())==='Block');
    if(!b) return false; b.click(); return true;
  });
  out.clicked=clicked;
  await page.waitForTimeout(4000);
  out.notices = await page.evaluate(()=>{clearInterval(window.__t);return window.__notices;});
  out.cardStillOpen = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('div,aside,section')].filter(vis)
      .some(e=>/QA Bob/.test(e.innerText||'')&&(e.innerText||'').length<700&&/Message|Block/.test(e.innerText||''));
  });
  out.blockedAfter = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
    const p=await r.json(); const a=p.users||p.blocked||p.data||[];
    return {count:a.length, sample:JSON.stringify(a).slice(0,120)};});
  return out;
};
