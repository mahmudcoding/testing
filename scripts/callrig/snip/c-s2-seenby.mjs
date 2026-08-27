export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const tag='QA-SEENBY-'+Math.random().toString(36).slice(2,5);
  const seed=await page.evaluate(async ({ch,tag})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch, body:tag})});
    const j=await r.json(); return j.id||j.message?.id;},{ch,tag});
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={tag, id:seed};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await page.waitForTimeout(1200);
  out.receiptElements=await msg.evaluate(e=>{
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>2&&r.height>2;};
    return [...e.querySelectorAll('*')].filter(v)
      .map(x=>({tag:x.tagName.toLowerCase(),
        aria:(x.getAttribute('aria-label')||'').slice(0,40),
        title:(x.getAttribute('title')||'').slice(0,40)}))
      .filter(x=>/sent|seen|read|deliver/i.test(x.aria+x.title));});
  return out;
};
