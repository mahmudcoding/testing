const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-OFFOPS target', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.id=id;
  await page.waitForTimeout(3000);
  const el=page.locator(`[data-message-id="${id}"]`).first();
  await el.scrollIntoViewIfNeeded();
  const snap=()=>page.evaluate((id)=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return {online:navigator.onLine,
      chips: e? [...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
        .filter(l=>l&&/react/i.test(l)&&!/Add reaction/.test(l)):null,
      text: e? (e.innerText||'').replace(/\s+/g,' ').slice(-40):null,
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(x=>x.textContent.trim().slice(0,50))};}, id);
  await ctx.setOffline(true); await page.waitForTimeout(1200);
  // react while offline
  await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Add reaction"]').first().click();
  await page.waitForTimeout(1800);
  const pick=page.locator('[role="dialog"] button, [data-radix-popper-content-wrapper] button').nth(3);
  out.picked=await pick.count()? await pick.getAttribute('aria-label'):'none';
  if(await pick.count()) await pick.click();
  const off=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(1200); off.push(await snap()); }
  out.reactOffline={first:off[0], last:off.at(-1),
    chipEver:off.some(x=>x.chips&&x.chips.length), notices:[...new Set(off.flatMap(x=>x.notices))]};
  await ctx.setOffline(false);
  const on=[]; for(let i=0;i<16;i++){ await page.waitForTimeout(1200); on.push(await snap()); }
  out.reactOnline={last:on.at(-1), chipEver:on.some(x=>x.chips&&x.chips.length),
    notices:[...new Set(on.flatMap(x=>x.notices))]};
  out.server=await page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {reactions:(m.reactions||[]).length}:'absent';}, {ch,id});
  return out;
};
