const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DMTHREAD-PARENT'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const p = page.locator('[data-message-id]').last();
  out.pid = await p.getAttribute('data-message-id');
  await p.hover(); await page.waitForTimeout(900);
  out.rowButtons = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean);
  });
  const hasReply = out.rowButtons.includes('Reply');
  out.hasReply = hasReply;
  if (hasReply) {
    await p.locator('button[aria-label="Reply"]').first().click({timeout:10000});
    await page.waitForTimeout(3500);
    out.afterReply = await page.evaluate(()=>({url:location.href,
      composers:document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]').length,
      repliesMarker:(document.body.innerText.match(/Replies \(\d+\)/)||[null])[0]}));
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type('QA-S2-DMTHREAD-R1'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
    out.afterSendReply = await page.evaluate(async (pid)=>{
      const r=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=10`,{credentials:'include'});
      let j=null; try{ j=await r.json(); }catch(e){}
      const c=await fetch('/api/v1/messaging/channels/C4OVEWOTJW1AA86/messages?limit=6',{credentials:'include'});
      const cj=await c.json();
      return {threadStatus:r.status, replies: j&&(j.replies||[]).length,
        inChannelList:(cj.messages||[]).some(m=>/DMTHREAD-R1/.test(m.body||'')),
        marker:(document.body.innerText.match(/Replies \(\d+\)|\d+ repl(y|ies)/)||[null])[0]};
    }, out.pid);
  }
  return out;
};
