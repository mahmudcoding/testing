export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/meeting/.test(u)&&r.request().method()!=='GET'){net.push({m:r.request().method(),u:u.replace('https://airion-cargo.store',''),s:r.status()});}});
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const started = await page.evaluate((n)=>{
    const rows=[...document.querySelectorAll('*')].filter(e=>e.children.length && (e.innerText||'').includes(n) && (e.innerText||'').length<80);
    const row=rows[rows.length-1]; if(!row) return 'no row';
    const b=[...row.querySelectorAll('button')].find(x=>/^Call$/i.test((x.textContent||'').trim()));
    if(!b) return 'no call btn'; b.click(); return 'ok';
  }, process.env.QA_WHO||'QA Carol');
  out.started=started;
  await page.waitForTimeout(7000);
  out.overlay = await page.evaluate(()=>{
    const vis = e=>{let a=e,op=1;while(a){const cs=getComputedStyle(a);op=Math.min(op,parseFloat(cs.opacity));if(cs.display==='none'||cs.visibility==='hidden')return false;a=a.parentElement;}return op>0.05&&e.getClientRects().length>0;};
    const ov=[...document.querySelectorAll('[role="dialog"],[data-testid*="call" i],section,div')].filter(e=>vis(e)&&/Ringing|Calling|calling/i.test(e.innerText||'')&&(e.innerText||'').length<300).pop();
    return {url:location.pathname,
      ovText: ov? (ov.innerText||'').replace(/\n+/g,' | ').slice(0,200):null,
      ovBtns: ov? [...ov.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()):null,
      allCallBtns: [...document.querySelectorAll('button')].filter(vis).map(b=>b.getAttribute('aria-label')).filter(l=>l&&/mute|camera|leave|cancel|end/i.test(l))};
  });
  out.net=net;
  return out;
};
