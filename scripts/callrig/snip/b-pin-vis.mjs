export default async ({page}) => {
  const id='C4QBPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const probe = () => page.evaluate(()=>{
    const el=document.querySelector('[data-testid="pinned-messages-transition"]');
    if(!el) return {missing:true};
    const cs=getComputedStyle(el), r=el.getBoundingClientRect();
    const txt=[...el.querySelectorAll('button,span,p')].map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean)[0]||'';
    let op=1,a=el; while(a){op=Math.min(op,parseFloat(getComputedStyle(a).opacity)); a=a.parentElement;}
    return {phase:el.dataset?.phase??null, opacity:cs.opacity, effectiveOpacity:op,
            h:Math.round(r.height), inert:el.hasAttribute('inert'), text:txt.slice(0,70)};
  });
  const pinnedTotal = () => page.evaluate(async(id)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${id}/messages/pinned`,{credentials:'include'})).json();
    return j?.total??j?.data?.total??null;
  }, id);
  const before={wrapper:await probe(), total:await pinnedTotal()};
  // pin the last message
  const ids = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  const mid=ids[ids.length-1];
  const art=await page.$(`[data-message-id="${mid}"]`);
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/^more actions$/i.test((x.getAttribute('aria-label')||'').trim()))?.click();}, mid);
  await page.waitForTimeout(1200);
  const clicked = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[role=menuitem]')].find(b=>/^pin/i.test((b.innerText||'').trim()));
    if(!el) return null; const t=(el.innerText||'').trim(); el.click(); return t;});
  await page.waitForTimeout(4500);
  const after={wrapper:await probe(), total:await pinnedTotal()};
  return {mid, clicked, before, after};
};
