export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return j?.data?.username||j?.username||'?';});
  const api = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=6',{credentials:'include'})).json();
    return (j?.data?.messages||j?.messages||[]).slice(0,3)
      .map(m=>({len:(m.body||'').length, head:(m.body||'').slice(0,14), seq:m.channel_seq, t:(m.created_at||'').slice(11,19)}));
  });
  const dom = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')].slice(-3)
    .map(a=>{const t=(a.innerText||'').replace(/\s+/g,' ');
      return {len:t.length, head:t.slice(0,46)};}));
  return {who, api, dom};
};
