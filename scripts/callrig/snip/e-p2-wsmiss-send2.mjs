const GEN='C4QEGENERAL0001';
export default async ({page}) => await page.evaluate(async ({GEN}) => {
  const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:GEN, body:'missedoutage probe from alice'})});
  return {status:r.status, at:new Date().toISOString().slice(11,19)};
}, {GEN});
