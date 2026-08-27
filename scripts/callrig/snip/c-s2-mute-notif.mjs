const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  out.before = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=5',{credentials:'include'});
    const j=await r.json(); return {total:j.total, unread:j.unread_count};
  });
  // mute the channel via the header control
  await page.locator('button[aria-label="Mute notifications"]').last().click({timeout:10000});
  await page.waitForTimeout(1500);
  out.menu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="dialog"],[role="menu"]')].filter(vis).pop();
    return p? [...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean):null;
  });
  const resp=[];
  page.on('response', r=>{ if(/mute/.test(r.url())) resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,50)}); });
  try { await page.locator('[data-radix-popper-content-wrapper] button, [role="dialog"] button').filter({hasText:/Until turned off/}).last().click({timeout:8000}); out.muted=true; }
  catch(e){ out.muteErr=String(e).slice(0,80); }
  await page.waitForTimeout(3000);
  out.muteResp = resp;
  out.state = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>/mute/i.test(x.getAttribute('aria-label')||'')).pop();
    return {label:b?b.getAttribute('aria-label'):null, pressed:b?b.getAttribute('aria-pressed'):null};
  });
  return out;
};
