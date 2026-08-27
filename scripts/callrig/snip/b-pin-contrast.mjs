export default async ({page}) => {
  const id='C4QBPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const banner = () => page.evaluate(()=>{
    const el=document.querySelector('[data-testid="pinned-messages-transition"]');
    if(!el) return {missing:true};
    let op=1,a=el; while(a){op=Math.min(op,parseFloat(getComputedStyle(a).opacity)); a=a.parentElement;}
    return {phase:el.dataset?.phase, effectiveOpacity:op, h:Math.round(el.getBoundingClientRect().height),
            text:(el.innerText||'').replace(/\s+/g,' ').slice(0,80)};
  });
  const act = async (mid, re) => {
    const art=await page.$(`[data-message-id="${mid}"]`); if(!art) return 'no msg';
    await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
    await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
      [...a.querySelectorAll('button')].find(x=>/^more actions$/i.test((x.getAttribute('aria-label')||'').trim()))?.click();}, mid);
    await page.waitForTimeout(1200);
    return await page.evaluate((re)=>{
      const el=[...document.querySelectorAll('[role=menuitem]')].find(b=>new RegExp(re,'i').test((b.innerText||'').trim()));
      if(!el) return null; const t=(el.innerText||'').trim(); el.click(); return t;}, re);
  };
  const unpinned = await act(process.env.QA_FWD, '^unpin');
  await page.waitForTimeout(4000);
  const mid1 = await act(process.env.QA_TXT, '^pin');
  await page.waitForTimeout(4500);
  const plainText = await banner();
  return {unpinned, pinnedPlain:mid1, plainText};
};
