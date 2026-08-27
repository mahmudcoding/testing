export default async ({page}) => {
  const id=process.env.QA_CH||'C4QBPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const banner = () => page.evaluate(()=>{
    // outermost element whose text mentions Pinned message / View all, height < 120
    const els=[...document.querySelectorAll('div')].filter(e=>{
      const r=e.getBoundingClientRect();
      if(r.width<200||r.height<10||r.height>120) return false;
      const t=(e.innerText||''); return /View all \(/i.test(t) && t.length<200;
    });
    const e=els[0];
    if(!e) return {present:false};
    const r=e.getBoundingClientRect();
    return {present:true, text:(e.innerText||'').replace(/\s+/g,' ').slice(0,140),
            h:Math.round(r.height), w:Math.round(r.width), y:Math.round(r.y)};
  });
  const pinnedApi = () => page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/messaging/channels/${id}/messages/pinned`,{credentials:'include'});
    const j=await r.json(); return {s:r.status, total:j?.total??j?.data?.total??null};
  }, id);
  const b0=await banner(), p0=await pinnedApi();
  const ids = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  const mid = process.env.QA_MID || ids[ids.length-1];
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1800);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/more/i.test(x.getAttribute('aria-label')||''))?.click();}, mid);
  await page.waitForTimeout(1200);
  const act = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[role=menuitem]')].find(b=>/unpin/i.test((b.innerText||'').trim()));
    if(!el) return null; const t=(el.innerText||'').trim(); el.click(); return t;
  });
  await page.waitForTimeout(4000);
  const b1=await banner(), p1=await pinnedApi();
  // reload to rule out stale client state
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  const b2=await banner(), p2=await pinnedApi();
  return {mid, clicked:act, before:{banner:b0,pinned:p0}, after:{banner:b1,pinned:p1}, afterReload:{banner:b2,pinned:p2}};
};
