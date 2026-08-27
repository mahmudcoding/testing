export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const msg = page.locator('[data-message-id="M4OWAUZE7PA2YX1"]');
  const n = await msg.count();
  if(!n) return {err:'forwarded msg not visible to carol'};
  const rendered = (await msg.innerText()).slice(0,300);
  const ctrls = await msg.evaluate(m => [...m.querySelectorAll('button,a')]
     .filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
     .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,40)).filter(Boolean));
  // can carol reach the source channel by API?
  const probe = await page.evaluate(async () => {
    const r = await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    let b=''; try{b=JSON.stringify(await r.json()).slice(0,200);}catch(e){}
    return {status:r.status, body:b};
  });
  return {rendered, ctrls: ctrls.slice(0,12), sourceChannelApi: probe};
};
