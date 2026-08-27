export default async ({page}) => {
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const n0 = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=50',{credentials:'include'})).json();
    return (j?.data?.messages||j?.messages||[]).length;});
  await page.click(sel);
  await page.keyboard.type('LINE-ONE',{delay:20});
  await page.keyboard.down('Shift'); await page.keyboard.press('Enter'); await page.keyboard.up('Shift');
  await page.waitForTimeout(500);
  const afterShift = await page.evaluate(async(s)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=50',{credentials:'include'})).json();
    return {n:(j?.data?.messages||j?.messages||[]).length,
            composer:JSON.stringify(document.querySelector(s)?.innerText||'')};}, sel);
  await page.keyboard.type('LINE-TWO',{delay:20});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const sent = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=3',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    return {n:arr.length, body:JSON.stringify((arr[0]?.body||'').slice(0,40))};});
  const rendered = await page.evaluate(()=>{const a=[...document.querySelectorAll('[data-message-id)')].slice(-1)[0];return null;}).catch(()=>null);
  const dom = await page.evaluate(()=>{const a=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
    return a?JSON.stringify((a.innerText||'').slice(-24)):null;});
  return {n0, afterShift, sentNoNewMsgFromShift: afterShift.n===n0, sent, dom};
};
