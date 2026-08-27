const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const out={};
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-EDITBOUND'); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  const msg = page.locator('[data-message-id]').last();
  out.id = await msg.getAttribute('data-message-id');
  await msg.hover(); await page.waitForTimeout(700);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Edit$/}).last().click({timeout:8000});
  await page.waitForTimeout(2000);
  // clear the edit field entirely
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(600);
  out.emptyEdit = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const s=[...document.querySelectorAll('button[aria-label="Save changes"]')].pop();
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {saveDisabled: s?s.disabled:null, composer:c?c.innerText.replace(/\n/g,'\\n').slice(0,30):null,
      banner: /Editing message/.test(document.body.innerText),
      errors:[...document.querySelectorAll('[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean)};
  });
  // try Meta+Enter on the empty edit
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(2500);
  out.afterEmptySave = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=3',{credentials:'include'});
    const j=await r.json(); const list=j.messages||[];
    return {topBodies:list.map(m=>m.body).slice(0,3), banner:/Editing message/.test(document.body.innerText)};
  });
  return out;
};
