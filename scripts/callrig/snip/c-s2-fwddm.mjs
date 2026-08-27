export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T', dest='C4OX0TTLIMVOUBH';
  const out={};
  const sidebarOrder=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('nav a, aside a')].filter(v)
      .filter(a=>/\/(c|d)\//.test(a.getAttribute('href')||''))
      .map(a=>(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,22));});
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(10000);
  out.orderBefore=await sidebarOrder();
  // post a distinctive message in the DM, then forward it to a channel
  const src=await page.evaluate(async(dm)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:dm, body:'QA-T6-FWDDM source in DM',
        idempotency_key:'qt6-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, dm);
  await page.reload(); await page.waitForTimeout(9000);
  const el=page.locator(`main [data-message-id="${src}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  await el.locator('button[aria-label="Forward"]').first().click();
  await page.waitForTimeout(2500);
  await page.locator('[role="dialog"] button').filter({hasText:/^#qa-c2-deep$/}).first().click();
  await page.waitForTimeout(1200);
  await page.locator('[role="dialog"] button').filter({hasText:/^Continue$/}).first().click();
  await page.waitForTimeout(2500);
  const send=page.locator('[role="dialog"] button').filter({hasText:/^(Forward|Send)$/}).first();
  out.sendFound=await send.count();
  if(out.sendFound){ await send.click(); await page.waitForTimeout(6000); }
  // ALK-2555: did the destination move to the top of the sidebar?
  out.orderAfterForward=await sidebarOrder();
  // ALK-2557: what does the forwarded card say the source was?
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dest}`);
  await page.waitForTimeout(10000);
  out.card=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-T6-FWDDM source in DM/.test(x.innerText||''));
    if(!e) return null;
    return {text:(e.innerText||'').replace(/\s+/g,' ').slice(0,110),
      mentionsDM: /Direct|DM|личн/i.test(e.innerText||''),
      showsChannelName: /#/.test(e.innerText||''),
      links:[...e.querySelectorAll('a,button')].map(x=>(x.innerText||'').trim().slice(0,22)).filter(Boolean).slice(0,6)};});
  return out;
};
