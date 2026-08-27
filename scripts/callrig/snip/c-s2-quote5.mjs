const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-QMD parent'); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  const parent = page.locator('[data-message-id]').last();
  await parent.hover(); await page.waitForTimeout(700);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(3000);
  // a reply containing markdown-ish characters
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-QMD **bold** _it_ a-b'); await page.keyboard.press('Enter'); await page.waitForTimeout(2800);
  const target = page.locator('[data-message-id]').filter({hasText:'QA-S2-QMD **bold**'}).last();
  out.targetRendered = await target.innerText().catch(()=>null);
  out.targetApi = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=5',{credentials:'include'});
    const j=await r.json(); return (j.messages||[]).filter(m=>/QMD/.test(m.body||'')).map(m=>m.body);
  });
  await target.scrollIntoViewIfNeeded().catch(()=>{});
  await target.hover(); await page.waitForTimeout(900);
  await target.locator('button[aria-label="Reply here"]').first().click({timeout:10000});
  await page.waitForTimeout(1800);
  out.chip = await page.evaluate(()=>{
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<5&&box;i++) box=box.parentElement;
    return box? box.innerText.replace(/\n+/g,' | ').slice(-150):null;
  });
  await comp().click(); await page.keyboard.type('QA-S2-QMD-QUOTING');
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.quotingMsg = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-QMD-QUOTING/.test(m.innerText||'')).pop();
    return el? {id:el.getAttribute('data-message-id'), text:el.innerText.replace(/\n+/g,' | ').slice(0,200)}:null;
  });
  return out;
};
