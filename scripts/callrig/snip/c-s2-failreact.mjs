export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  // a fresh target
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-FAILREACT', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.id=id;
  await page.waitForTimeout(2500);
  await page.route('**/reactions**', r=>r.abort('failed'));
  const el=page.locator(`[data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Add reaction"]').first().click();
  await page.waitForTimeout(1500);
  const pick=page.locator('[role="dialog"] button, [data-radix-popper-content-wrapper] button').nth(3);
  out.picked=await pick.count()? await pick.getAttribute('aria-label'):'none';
  if(await pick.count()) await pick.click();
  const s=[];
  for(let i=0;i<10;i++){ await page.waitForTimeout(500);
    s.push(await page.evaluate((id)=>{
      const e=document.querySelector(`[data-message-id="${id}"]`);
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      return {chips: e? [...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
          .filter(l=>l&&/react/i.test(l)&&!/Add reaction/.test(l)):null,
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,50))};
    }, id));
  }
  await page.unroute('**/reactions**');
  out.first=s[0]; out.last=s.at(-1);
  out.noticesSeen=[...new Set(s.flatMap(x=>x.notices))];
  out.chipEverShown=s.some(x=>x.chips&&x.chips.length>0);
  // truth from the server
  out.server = await page.evaluate(async({ch,id})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===id);
    return m? {reactions:m.reactions||null}:'gone';
  }, {ch,id});
  await page.reload(); await page.waitForTimeout(6000);
  out.afterReload = await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return e? [...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
      .filter(l=>l&&/react/i.test(l)&&!/Add reaction/.test(l)):'absent';
  }, id);
  return out;
};
