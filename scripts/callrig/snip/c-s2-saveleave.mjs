const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  out.savedBefore = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const rows=[...document.querySelectorAll('[data-message-id]')];
    return {n:rows.length, texts:rows.map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,80)),
      buttons: rows.length? [...rows[rows.length-1].querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean):null};
  });
  // leave the channel the saved messages came from
  out.leave = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/leave`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'}});
    return {s:r.status, b:(await r.text()).slice(0,110)};
  }, GEN);
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.savedAfter = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const rows=[...document.querySelectorAll('[data-message-id]')];
    return {n:rows.length, texts:rows.map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,90)),
      buttons: rows.length? [...rows[rows.length-1].querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean):null};
  });
  // try Open source message from a saved entry whose channel we left
  if (out.savedAfter.n) {
    const row = page.locator('[data-message-id]').last();
    await row.scrollIntoViewIfNeeded().catch(()=>{});
    await row.hover(); await page.waitForTimeout(900);
    try {
      const b = row.locator('button[aria-label="Open source message"]').first();
      await b.hover().catch(()=>{}); await page.waitForTimeout(400);
      await b.click({timeout:8000, force:true});
      const frames=[];
      for (let i=0;i<12;i++){ await page.waitForTimeout(300);
        frames.push(await page.evaluate(()=>{
          const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
          return {url:location.href,
            toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2)};})); }
      out.openSource = frames.filter((f,i)=> i===0 || JSON.stringify(f)!==JSON.stringify(frames[i-1]));
    } catch(e){ out.openSrcErr=String(e).slice(0,90); }
  }
  return out;
};
