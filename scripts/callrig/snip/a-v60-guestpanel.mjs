const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)){ let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,52),s:r.status(),res:b});}});
  await page.locator('button[aria-label="Side Rooms"]').first().click();
  await page.waitForTimeout(3000);
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24)).filter(Boolean).slice(0,12) };},VS);
  const j = page.locator('button',{hasText:/^Join$/}).first();
  out.joinFound = await j.count()>0;
  if(out.joinFound){ await j.click(); await page.waitForTimeout(8000); }
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(0,46),
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Room G|Guest Pass/.test(t)).slice(0,4),
      leaveBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,22)).filter(t=>/leave|close/i.test(t)),
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,220) };},VS);
  out.requests=net;
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-room-joined.png'});
  return out;
};
