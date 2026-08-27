const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out={};
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Continue$/}).last().click({timeout:8000});
  await page.waitForTimeout(2000);
  out.step2 = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,240),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24))}:null;
  });
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Send$/}).last().click({timeout:8000});
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(async (gen)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const g=await fetch(`/api/v1/messaging/channels/${gen}/messages?limit=3`,{credentials:'include'});
    const gj=await g.json();
    return {generalTop:(gj.messages||[]).map(m=>({body:(m.body||'').slice(0,26), fwd: m.forwarded_from? 'yes':'no'})),
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).length,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
  }, GEN);
  // saved messages page
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  out.saved = await page.evaluate(()=>{
    const main=document.querySelector('main')||document.body;
    return {hasFwd:/QA-S2-FWDMULTI/.test(main.innerText), text:main.innerText.replace(/\n+/g,' | ').slice(0,220)};
  });
  return out;
};
