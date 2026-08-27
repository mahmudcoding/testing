export default async ({page}) => {
  const id='C4QBPRIVATE0001', mid=process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const raw = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/messaging/channels/${id}/messages?limit=30`,{credentials:'include'});
    const t=await r.text(); return t.slice(0,900);
  }, id);
  const dom = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')].map(a=>{
    const r=a.getBoundingClientRect();
    return {id:a.getAttribute('data-message-id'), text:(a.innerText||'').replace(/\s+/g,' ').slice(0,90),
            h:Math.round(r.height), w:Math.round(r.width)};
  }));
  return {raw, dom};
};
