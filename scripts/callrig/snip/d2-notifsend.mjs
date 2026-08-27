// Post a message into a channel as this account. QA_CH, QA_BODY
export default async ({page}) => {
  const ch=process.env.QA_CH, body=process.env.QA_BODY;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/'+ch,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(async ({ch,body})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({channel_id:ch, body})});
    const t=await r.text();
    return {status:r.status, id:(t.match(/"id":"([^"]+)"/)||[])[1]};
  }, {ch,body});
};
