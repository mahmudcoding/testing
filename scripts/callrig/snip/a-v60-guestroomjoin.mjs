const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)){ let b=null;try{b=(await r.text()).slice(0,110);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,52),s:r.status(),res:b});}});
  // accept the invite
  for(const lbl of ['Accept','Join']){
    const b=page.locator('button',{hasText:new RegExp('^'+lbl+'$')}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.clicked=lbl; break; }
  }
  await page.waitForTimeout(7000);
  const state = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(0,46),
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Room G|Guest Pass/.test(t)).slice(0,4),
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,22)).filter(t=>/leave|close/i.test(t)),
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,200) };},VS);
  out.afterJoin = await state();
  out.requests = net;
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-in-room.png'});
  return out;
};
