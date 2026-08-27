export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // ── ALK-3534: the link preview card repeats the domain three times
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-T3-PREVIEW https://example.com/some/page',
        idempotency_key:'qt3-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.reload(); await page.waitForTimeout(12000);
  out.alk3534=await page.evaluate((id)=>{
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    if(!e) return 'message not rendered';
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    const leaves=[...e.querySelectorAll('*')].filter(x=>x.children.length===0&&v(x))
      .map(x=>(x.textContent||'').trim()).filter(Boolean);
    const txt=(e.innerText||'').replace(/\s+/g,' ');
    const domainHits=(txt.match(/example\.com/g)||[]).length;
    return {visibleLeaves:leaves.slice(0,10), domainOccurrences:domainHits,
      fullText:txt.slice(-90),
      links:[...e.querySelectorAll('a')].filter(v).map(a=>({t:(a.innerText||'').trim().slice(0,30), href:(a.getAttribute('href')||'').slice(0,40)}))};}, id);
  return out;
};
