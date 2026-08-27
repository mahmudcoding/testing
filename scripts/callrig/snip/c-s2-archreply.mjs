const WS='W4QCF1XTURESO01', ARCH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${ARCH}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  const out={}; const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET')
    resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,52)}); });
  const row = page.locator('[data-message-id]').last();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(900);
  const before = await page.evaluate(()=>({
    menus:[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}).length}));
  await row.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(4000);
  out.afterReplyClick = await page.evaluate(()=>({
    url:location.href,
    composers:document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]').length,
    threadOpen:/[?&]thread=/.test(location.href),
    repliesMarker:(document.body.innerText.match(/Replies \(\d+\)/)||[null])[0]}));
  if (out.afterReplyClick.composers) {
    const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type('QA-S2-ARCH-REPLY');
    await page.keyboard.press('Enter'); await page.waitForTimeout(4000);
    out.afterSend = await page.evaluate(async ()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const pid=new URL(location.href).searchParams.get('thread');
      let th=null;
      if (pid) { const r=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=10`,{credentials:'include'});
        const j=await r.json(); th={status:r.status, replies:(j.replies||[]).length}; }
      return {thread:th, bodyHasReply:/QA-S2-ARCH-REPLY/.test(document.body.innerText),
        toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
    });
  }
  out.resp = resp;
  return out;
};
