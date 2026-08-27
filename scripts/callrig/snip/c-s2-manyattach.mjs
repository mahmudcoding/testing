const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  const files = Array.from({length:12},(_,i)=>`${DIR}/qa-s2-many-${String(i+1).padStart(2,'0')}.png`);
  await page.locator('input[type=file]').first().setInputFiles(files);
  await page.waitForTimeout(9000);
  out.attached = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<6&&box;i++) box=box.parentElement;
    return {chips: box? [...box.querySelectorAll('button[aria-label="Remove attachment"]')].filter(vis).length:0,
      errors: box? (box.innerText.match(/too large|unsupported|error|limit/gi)||[]):[],
      sendDisabled:(()=>{const s=[...document.querySelectorAll('button[aria-label="Send"]')].pop(); return s?s.disabled:null;})(),
      area: box? box.innerText.replace(/\n+/g,' | ').slice(-150):null};
  });
  if (out.attached.sendDisabled === false) {
    await page.locator('button[aria-label="Send"]').last().click({timeout:8000});
    await page.waitForTimeout(10000);
    out.sent = await page.evaluate(async ()=>{
      const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
      const j=await r.json(); const m=(j.messages||[])[0]||{};
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      const rect=el.getBoundingClientRect();
      return {files:(m.files||[]).length, imgs: el.querySelectorAll('img').length,
        rect:{w:Math.round(rect.width), h:Math.round(rect.height), right:Math.round(rect.right)},
        viewport:innerWidth, pageOverflow: document.documentElement.scrollWidth>document.documentElement.clientWidth};
    });
  }
  return out;
};
