export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    return arr.slice(0,8).map(m=>({len:(m.body||'').length, head:(m.body||'').slice(0,12), t:(m.created_at||'').slice(11,19)}));
  });
};
