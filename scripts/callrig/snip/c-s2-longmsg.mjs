const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  out.before = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    const j=await r.json(); return {n:document.querySelectorAll('[data-message-id]').length, topId:(j.messages||[])[0]?.id};
  });
  // build a 5000-char message: LONGxxxx markers every 100 chars
  const text = Array.from({length:50},(_,i)=>`LONG${String(i).padStart(3,'0')}`+'x'.repeat(92)).join('');
  out.inputLen = text.length;
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.evaluate((t)=>{
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    c.focus();
    document.execCommand('insertText', false, t);
  }, text);
  await page.waitForTimeout(2500);
  out.counter = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<6&&box;i++) box=box.parentElement;
    const t = box? box.innerText:'';
    return {len:c.innerText.length, counterText:(t.match(/\d+\s*\/\s*\d+/)||[null])[0],
      hint:(t.match(/[^\n]*max[^\n]*/i)||[null])[0],
      sendDisabled:(()=>{const s=[...document.querySelectorAll('button[aria-label="Send"]')].pop(); return s?s.disabled:null;})()};
  });
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.after = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=5',{credentials:'include'});
    const j=await r.json(); const list=j.messages||[];
    return {n:document.querySelectorAll('[data-message-id]').length,
      top: list.slice(0,4).map(m=>({id:m.id.slice(-6), len:(m.body||'').length,
        head:(m.body||'').slice(0,14), tail:(m.body||'').slice(-14)}))};
  });
  return out;
};
