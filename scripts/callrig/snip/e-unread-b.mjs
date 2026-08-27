export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/c/C4QEGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:'C4QEGENERAL0001', body:'unread badge probe from bob'})});
    return {s:r.status, b:(await r.text()).slice(0,90)};
  });
};
