const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  out.members = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
    const j=await r.json(); const l=(j.members||j.data||[]);
    return {n:l.length, ids:l.map(m=>m.user_id)};
  }, GEN);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  for (const c of '@Dave') { await page.keyboard.type(c); await page.waitForTimeout(320); }
  await page.waitForTimeout(1600);
  out.suggestion = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"]')].filter(vis).pop();
    return p? {text:p.innerText.replace(/\n+/g,' | ').slice(0,140),
      items:[...p.querySelectorAll('button,[role="option"]')].filter(vis).map(b=>(b.textContent||'').trim().slice(0,26)).filter(Boolean)}:null;
  });
  if (out.suggestion && out.suggestion.items && out.suggestion.items.length) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    await page.keyboard.type(' QA-S2-MENTION-NONMEMBER');
    await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
    out.sent = await page.evaluate(async (ch)=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
      const j=await r.json(); const m=(j.messages||[])[0]||{};
      return {body:(m.body||'').slice(0,44), mention_ids:JSON.stringify(m.mention_ids||null)};
    }, GEN);
  } else {
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  }
  return out;
};
