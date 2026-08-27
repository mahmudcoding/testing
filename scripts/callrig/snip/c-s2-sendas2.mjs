const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-pic.png`);
  await page.waitForTimeout(5000);
  await page.locator('button[aria-label="Send as file"]').first().click({timeout:8000});
  await page.waitForTimeout(1500);
  out.afterToggle = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<6&&box;i++) box=box.parentElement;
    return {area: box? box.innerText.replace(/\n+/g,' | ').slice(-140):null,
      buttons: box? [...box.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(t=>/send as|remove attach/i.test(t)):[]};
  });
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.sent = await page.evaluate(async ()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {type:m.type, files:JSON.stringify(m.files||[]).slice(0,200),
      dom: el? el.innerText.replace(/\n+/g,' | ').slice(0,90):null,
      imgCount: el? el.querySelectorAll('img').length:0,
      buttons: el? [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean):[]};
  });
  return out;
};
