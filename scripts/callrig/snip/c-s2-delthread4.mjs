const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DT3-PARENT'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const parent = page.locator('[data-message-id]').last();
  const pid = await parent.getAttribute('data-message-id');
  out.pid = pid;
  await parent.hover(); await page.waitForTimeout(800);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(3500);
  for (const t of ['QA-S2-DT3-R1','QA-S2-DT3-R2','QA-S2-DT3-R3']) {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type(t); await page.keyboard.press('Enter'); await page.waitForTimeout(2600);
  }
  out.before = await page.evaluate(async (p)=>{
    const r=await fetch(`/api/v1/messaging/messages/${p}/thread?limit=10`,{credentials:'include'});
    const j=await r.json(); return {s:r.status, replies:(j.replies||[]).length};
  }, pid);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  const p2 = page.locator(`[data-message-id="${pid}"]`).first();
  await p2.scrollIntoViewIfNeeded().catch(()=>{});
  await p2.hover(); await page.waitForTimeout(800);
  await p2.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(1500);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(4500);
  // fresh load then open the thread
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}?thread=${pid}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.after = await page.evaluate(async (p)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const t=await fetch(`/api/v1/messaging/messages/${p}/thread?limit=10`,{credentials:'include'});
    const tb=(await t.text()).slice(0,150);
    const c=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=20',{credentials:'include'});
    const cj=await c.json();
    const par=(cj.messages||[]).find(m=>m.id===p);
    const body=document.body.innerText;
    return {threadStatus:t.status, threadBody:tb,
      parentReplyCount: par? par.reply_count : null, parentBody: par? (par.body||'') : null,
      repliesMarker:(body.match(/Replies \(\d+\)/)||[null])[0],
      errorText:(body.match(/Could not load replies\.?/)||[null])[0],
      retry:[...document.querySelectorAll('button')].filter(vis).some(b=>/^Retry$/.test((b.textContent||'').trim())),
      anyReplyText:/QA-S2-DT3-R/.test(body)};
  }, pid);
  return out;
};
