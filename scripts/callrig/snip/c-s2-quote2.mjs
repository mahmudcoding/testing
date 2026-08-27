const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  // parent message
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-QT-PARENT'); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  const parent = page.locator('[data-message-id]').last();
  out.parentId = await parent.getAttribute('data-message-id');
  await parent.hover(); await page.waitForTimeout(700);
  await page.locator('button[aria-label="Reply"]').last().click({timeout:8000});
  await page.waitForTimeout(3000);
  // two replies in the thread
  for (const t of ['QA-S2-QT-REPLY-A','QA-S2-QT-REPLY-B']) {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type(t); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  }
  // enumerate actions on reply A inside the thread panel
  const replyA = page.locator('[data-message-id]').filter({hasText:'QA-S2-QT-REPLY-A'}).last();
  await replyA.hover(); await page.waitForTimeout(800);
  out.replyActions = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-QT-REPLY-A/.test(m.innerText||'')).pop();
    if(!el) return null;
    return {buttons:[...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean)};
  });
  await replyA.click({button:'right'}).catch(()=>{});
  await page.waitForTimeout(1500);
  out.replyMenu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
    return p? {items:[...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)).filter(Boolean)}:null;
  });
  return out;
};
