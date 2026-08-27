export default async ({page}) => {
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.click(sel);
  await page.keyboard.insertText('   PADDED middle   ');
  await page.waitForTimeout(600);
  const typed = await page.evaluate((s)=>JSON.stringify(document.querySelector(s)?.innerText||''), sel);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const stored = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=2',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[])[0];
    return JSON.stringify(m?.body||'');});
  const rendered = await page.evaluate(()=>{const a=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
    return a?JSON.stringify((a.innerText||'').split('\n').pop()):null;});
  return {typed, stored, rendered};
};
