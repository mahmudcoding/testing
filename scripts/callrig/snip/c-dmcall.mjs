export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/meeting/.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,140);}catch(e){} net.push({m:r.request().method(),u:u.replace('https://airion-cargo.store',''),s:r.status(),b});}});
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate((n)=>{const el=[...document.querySelectorAll('button,[role="button"],a')].find(e=>(e.innerText||'').includes(n)); if(el)el.click();}, process.env.QA_WHO||'QA Carol');
  await page.waitForTimeout(2200);
  out.callClicked = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop()||document.body;
    const b=[...d.querySelectorAll('button')].find(x=>/^Call$/i.test((x.textContent||'').trim()));
    if(!b||b.disabled) return false; b.click(); return true;});
  await page.waitForTimeout(6000);
  out.ringing = await page.evaluate(()=>({url:location.pathname,
    txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(-260),
    btns:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(-8)}));
  out.callId=(out.ringing.url.split('/call/')[1]||'').split('?')[0];
  if (process.env.QA_HANGUP==='1') {
    net.length=0;
    const t0=Date.now();
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Leave call"]')].find(x=>x.getClientRects().length); if(b)b.click();});
    await page.waitForTimeout(1500);
    out.confirmAfterHangup = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop(); return d?(d.innerText||'').replace(/\n+/g,' | ').slice(0,200):null;});
    await page.waitForTimeout(2500);
    out.afterHangup = await page.evaluate(()=>({url:location.pathname, ms:Date.now()}));
    out.hangupMs = Date.now()-t0;
  }
  out.net=net;
  return out;
};
