const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  const reqs=[];
  page.on('request', r => { if (r.url().includes('/api/v1/channels') && r.method()==='POST')
      reqs.push({url:r.url().slice(-40), method:r.method(), post:(r.postData()||'').slice(0,200)}); });
  const out={};
  // find the add-channel entry point
  out.entry = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30))
      .filter(t=>/add|create|new|channel|\+/i.test(t)).slice(0,12);
  });
  let opened=false;
  for (const sel of ['button[aria-label="Add channel"]','button[aria-label="Create channel"]','button[aria-label="Add channels"]']) {
    try { await page.locator(sel).last().click({timeout:4000}); opened=true; break; } catch(e){}
  }
  out.opened = opened;
  await page.waitForTimeout(2000);
  out.dialog = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if(!d) return null;
    return {title:(d.querySelector('h1,h2,h3')?.textContent||'').trim(),
      text:d.innerText.replace(/\n+/g,' | ').slice(0,220),
      inputs:[...d.querySelectorAll('input,textarea')].filter(vis).map(i=>({l:i.getAttribute('aria-label')||i.placeholder, t:i.type}))};
  });
  if (out.dialog) {
    await page.locator('[role="dialog"] input:visible').first().fill('   QA C2 Create Norm   ');
    await page.waitForTimeout(500);
    try { await page.locator('[role="dialog"] button:visible').filter({hasText:/^Create$/}).last().click({timeout:8000}); } catch(e){ out.createErr=String(e).slice(0,80); }
    await page.waitForTimeout(3000);
  }
  out.requests = reqs;
  out.after = await page.evaluate(()=>({url:location.href,
    header:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,70),
    sidebar:[...document.querySelectorAll('a')].map(a=>(a.textContent||'').trim()).filter(t=>/qa.c2|QA C2/i.test(t))}));
  return out;
};
