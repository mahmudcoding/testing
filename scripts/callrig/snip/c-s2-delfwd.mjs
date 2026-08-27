const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  // source message in qa-private
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DELFWD-SOURCE'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const src = page.locator('[data-message-id]').last();
  out.srcId = await src.getAttribute('data-message-id');
  // forward it into the same channel (simplest: forward to Saved + this channel)
  await src.hover(); await page.waitForTimeout(800);
  await src.locator('button[aria-label="Forward"]').first().click({timeout:10000});
  await page.waitForTimeout(2500);
  await page.locator('[role="dialog"] button').filter({hasText:/^qa-private$/}).first().click({timeout:8000});
  await page.waitForTimeout(800);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Continue$/}).last().click({timeout:8000});
  await page.waitForTimeout(1800);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Send$/}).last().click({timeout:8000});
  await page.waitForTimeout(4500);
  out.fwdBefore = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {id:el.getAttribute('data-message-id'), text:el.innerText.replace(/\n+/g,' | ').slice(0,120)};
  });
  // delete the source
  const s2 = page.locator(`[data-message-id="${out.srcId}"]`).first();
  await s2.scrollIntoViewIfNeeded().catch(()=>{});
  await s2.hover(); await page.waitForTimeout(800);
  await s2.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(1500);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(4500);
  // fresh load, inspect the forwarded card
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.fwdAfter = await page.evaluate(async (fid)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=document.querySelector(`[data-message-id="${fid}"]`);
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=6',{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===fid);
    return {domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,140):null,
      buttons: el? [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean):null,
      apiFwd: m&&m.forwarded_from? JSON.stringify({body:m.forwarded_from.body, id:(m.forwarded_from.message_id||'').slice(-6)}).slice(0,140):null};
  }, out.fwdBefore.id);
  // deep-link to the deleted source
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}?m=${out.srcId}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  out.deepLinkDeleted = await page.evaluate((sid)=>{
    const el=document.querySelector(`[data-message-id="${sid}"]`);
    return {present:!!el, text: el? el.innerText.replace(/\n+/g,' | ').slice(0,70):null,
      inViewport: el? (el.getBoundingClientRect().y>=0 && el.getBoundingClientRect().y<innerHeight):null};
  }, out.srcId);
  return out;
};
