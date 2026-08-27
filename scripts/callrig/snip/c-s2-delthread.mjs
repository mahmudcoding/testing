const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DELTHREAD-PARENT'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const parent = page.locator('[data-message-id]').last();
  out.parentId = await parent.getAttribute('data-message-id');
  await parent.hover(); await page.waitForTimeout(800);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(3500);
  for (const t of ['QA-S2-DELTHREAD-R1','QA-S2-DELTHREAD-R2']) {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type(t); await page.keyboard.press('Enter'); await page.waitForTimeout(2800);
  }
  out.beforeDelete = await page.evaluate(async (pid)=>{
    const r=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
    const j=await r.json();
    return {replies:(j.replies||[]).length, marker:(document.body.innerText.match(/Replies \(\d+\)|\d+ repl(y|ies)/)||[null])[0]};
  }, out.parentId);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // delete the parent
  const p2 = page.locator(`[data-message-id="${out.parentId}"]`).first();
  await p2.scrollIntoViewIfNeeded().catch(()=>{});
  await p2.hover(); await page.waitForTimeout(800);
  await p2.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(1500);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(4500);
  out.afterDelete = await page.evaluate(async (pid)=>{
    const r=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
    let j=null; try{ j=await r.json(); }catch(e){}
    const el=document.querySelector(`[data-message-id="${pid}"]`);
    return {threadStatus:r.status, replies: j&&(j.replies||[]).length,
      parentBody: j&&j.parent? (j.parent.body||'').slice(0,20):null,
      rowText: el? el.innerText.replace(/\n+/g,' | ').slice(0,80):null,
      marker:(document.body.innerText.match(/\d+ repl(y|ies)/)||[null])[0]};
  }, out.parentId);
  // can the thread still be opened?
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}?thread=${out.parentId}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  out.threadDeepLink = await page.evaluate(()=>{
    const main=document.querySelector('main')||document.body;
    return {url:location.href, text:main.innerText.replace(/\n+/g,' | ').slice(-260),
      hasR1:/QA-S2-DELTHREAD-R1/.test(main.innerText), composers:document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]').length};
  });
  return out;
};
