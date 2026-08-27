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
  await page.waitForTimeout(1200);
  out.toggleState = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(t=>/send as/i.test(t));
  });
  // click the Send button rather than Enter, so focus can't re-trigger the toggle
  const send = page.locator('button[aria-label="Send"]').last();
  out.sendDisabled = await send.isDisabled();
  await send.click({timeout:8000});
  await page.waitForTimeout(5500);
  out.result = await page.evaluate(async ()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=2',{credentials:'include'});
    const j=await r.json();
    const api=(j.messages||[]).map(m=>({id:m.id.slice(-6), files:(m.files||[]).map(f=>f.filename), at:m.created_at}));
    const rows=[...document.querySelectorAll('[data-message-id]')].slice(-2).map(e=>({
      id:e.getAttribute('data-message-id').slice(-6), imgs:e.querySelectorAll('img').length,
      text:e.innerText.replace(/\n+/g,' | ').slice(0,80),
      buttons:[...e.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean)}));
    return {api, rows};
  });
  return out;
};
