export default async ({page}) => {
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.click(sel);
  await page.keyboard.type('@qa_b_bo',{delay:60});
  await page.waitForTimeout(1800);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  await page.keyboard.type(' second_check with-dash and *star*',{delay:20});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const sent = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=3',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[])[0];
    return {id:m?.id, body:(m?.body||'').slice(0,140)};
  });
  const dom = await page.evaluate(()=>{
    const a=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,110):null;});
  return {sent, dom};
};
