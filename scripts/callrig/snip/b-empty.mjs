export default async ({page}) => {
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const count = () => page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=50',{credentials:'include'})).json();
    return (j?.data?.messages||j?.messages||[]).length;});
  const t0 = await count();
  await page.click(sel);
  await page.keyboard.press('Enter');              // fully empty
  await page.waitForTimeout(1800);
  const t1 = await count();
  await page.keyboard.type('     ',{delay:20});    // whitespace only
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const t2 = await count();
  const sendBtn = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/^send/i.test((x.getAttribute('aria-label')||'').trim()));
    return b?{label:b.getAttribute('aria-label'), disabled:b.disabled||b.getAttribute('aria-disabled')}:null;});
  const composer = await page.evaluate((s)=>JSON.stringify(document.querySelector(s)?.innerText||''), sel);
  return {t0, afterEmptyEnter:t1, afterWhitespaceEnter:t2,
          blockedEmpty:t1===t0, blockedWhitespace:t2===t1, sendBtn, composer};
};
