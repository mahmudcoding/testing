export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .find(e=>(e.getAttribute('aria-label')||'')==="Open QA Bob's profile");
    if(el) el.click();
  });
  await page.waitForTimeout(2400);
  out.cardText = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('aside,section,div')].filter(vis)
      .filter(e=>/QA Bob/.test(e.innerText||'')&&(e.innerText||'').length<800)
      .sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,300):'(none)';
  });
  out.unblock = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({user_id:'U4QDBOB00000001'})});
    return {s:r.status,t:(await r.text()).slice(0,90)};
  });
  await page.waitForTimeout(1200);
  out.blockedNow = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
    const p=await r.json(); return (p.users||p.blocked||p.data||[]).length;});
  return out;
};
