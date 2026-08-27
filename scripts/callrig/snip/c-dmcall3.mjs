export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/meeting/.test(u)&&r.request().method()!=='GET'){net.push({m:r.request().method(),u:u.replace('https://airion-cargo.store',''),s:r.status()});}});
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // open the person card, then use its Call button
  await page.evaluate((n)=>{const el=[...document.querySelectorAll('button[aria-label]')].find(e=>(e.getAttribute('aria-label')||'').includes(`Open ${n}'s profile`)); if(el)el.click();}, process.env.QA_WHO||'QA Carol');
  await page.waitForTimeout(2500);
  out.card = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop(); return d?(d.innerText||'').replace(/\n+/g,' | ').slice(0,150):null;});
  out.clicked = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop(); if(!d) return false;
    const b=[...d.querySelectorAll('button')].find(x=>/^Call$/i.test((x.textContent||'').trim())); if(!b||b.disabled) return false; b.click(); return true;});
  await page.waitForTimeout(8000);
  out.state = await page.evaluate(()=>{
    const vis = e=>{let a=e,op=1;while(a){const cs=getComputedStyle(a);op=Math.min(op,parseFloat(cs.opacity));if(cs.display==='none'||cs.visibility==='hidden')return false;a=a.parentElement;}return op>0.05&&e.getClientRects().length>0;};
    const body=(document.body.innerText||'').replace(/\n+/g,' | ');
    return {url:location.pathname, tail: body.slice(-300),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(-10)};
  });
  out.net=net;
  return out;
};
