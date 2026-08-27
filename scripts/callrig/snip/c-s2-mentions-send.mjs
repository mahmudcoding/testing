const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const out={};
  const send = async (prefix, tail, label) => {
    await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type(prefix);
    await page.waitForTimeout(1500);
    const sug = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="listbox"]')].filter(vis).pop();
      return p? p.innerText.replace(/\n+/g,' | ').slice(0,90):null;
    });
    await page.keyboard.press('Enter'); await page.waitForTimeout(700);
    await page.keyboard.type(tail);
    await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
    const m = await page.evaluate(async (ch)=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
      const j=await r.json(); const x=(j.messages||[])[0]||{};
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      return {id:x.id, body:x.body, hasMentionsField:'mentions' in x, dom: el? el.innerText.replace(/\n+/g,' | ').slice(0,80):null};
    }, GEN);
    return {label, suggestion:sug, msg:m};
  };
  out.direct = await send('@QA Bob', ' QA-S2-MENT-DIRECT', 'direct');
  out.here   = await send('@here', ' QA-S2-MENT-HERE', 'here');
  return out;
};
