export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dst='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  await page.waitForTimeout(7500);
  // pick an existing forwarded card that has text
  const id=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-S2-FWDATT source/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  out.sourceCard=id;
  if(!id) return out;
  const el=page.locator(`[data-message-id="${id}"]`).first();
  out.cardText=await el.evaluate(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,80));
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2300);
  const picked=await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    const cand=[...d.querySelectorAll('button,[role="option"],li')]
      .filter(e=>/QA Carol/.test((e.textContent||'')) && e.getBoundingClientRect().height>10);
    if(!cand.length) return null;
    cand[cand.length-1].setAttribute('data-qa-dest','1'); return 'carol';});
  out.picked=picked;
  if(!picked){ await page.keyboard.press('Escape'); return out; }
  await page.locator('[data-qa-dest="1"]').click(); await page.waitForTimeout(1300);
  await page.locator('[role="dialog"] button').filter({hasText:/^Continue$/}).first().click();
  await page.waitForTimeout(2000);
  await page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send)$/}).first().click();
  await page.waitForTimeout(4500);
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/d/C4OVEWOTJW1AA86`);
  await page.waitForTimeout(8000);
  out.result=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].slice(-1)[0];
    return e? {txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,120),
      imgs:e.querySelectorAll('img').length,
      btns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,6)}:null;});
  out.api=await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4OVEWOTJW1AA86/messages?limit=3',{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[])[0];
    return m? {body:(m.body||'').slice(0,30),
      fwd: m.forwarded_from? {body:(m.forwarded_from.body||'').slice(0,40),
        files:(m.forwarded_from.files||[]).length,
        nested: !!m.forwarded_from.forwarded_from}:null}:null;});
  return out;
};
