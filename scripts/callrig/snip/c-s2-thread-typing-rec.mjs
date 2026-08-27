const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6500);
  const parent = page.locator('[data-message-id]').filter({hasText:'QA-S2-QMD parent'}).last();
  await parent.scrollIntoViewIfNeeded().catch(()=>{});
  await parent.hover(); await page.waitForTimeout(800);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>{
    if (window.__tt) clearInterval(window.__tt.id);
    const rec={events:[], t0:performance.now()};
    const push=(why)=>{
      const rows=[...document.querySelectorAll('p,div,span')].filter(e=>e.children.length===0 && /is typing|are typing/i.test(e.textContent||''))
        .map(e=>{const r=e.getBoundingClientRect(); return {t:(e.textContent||'').trim().slice(0,40), x:Math.round(r.x), y:Math.round(r.y), h:Math.round(r.height)};});
      const last=rec.events[rec.events.length-1];
      const key=JSON.stringify(rows);
      if(!last||last.key!==key) rec.events.push({key, ms:Math.round(performance.now()-rec.t0), rows, vis:document.visibilityState});
    };
    const mo=new MutationObserver(()=>push('mut')); mo.observe(document.body,{subtree:true,childList:true,characterData:true});
    rec.id=setInterval(()=>push('tick'),400);
    window.__tt=rec;
    return {started:true, url:location.href, vis:document.visibilityState};
  });
};
