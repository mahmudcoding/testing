const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const out={};
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const ch of '@Bob') { await page.keyboard.type(ch); await page.waitForTimeout(350); }
  await page.waitForTimeout(1500);
  out.suggestion = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"]')].filter(vis).pop();
    return p? p.innerText.replace(/\n+/g,' | ').slice(0,120):null;
  });
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  await page.keyboard.type(' QA-S2-MENT-DIRECT2');
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.msg = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const j=await r.json(); const x=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {id:x.id, body:x.body, keys:Object.keys(x).join(','), dom: el? el.innerText.replace(/\n+/g,' | ').slice(0,80):null};
  }, GEN);
  return out;
};
