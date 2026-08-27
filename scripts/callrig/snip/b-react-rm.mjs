export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=10',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji,c:r.count}));
  }, mid);
  const t0=await api();
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  const clicked = await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>/^remove .* reaction$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return null; const l=b.getAttribute('aria-label'); b.click(); return l;
  }, mid);
  await page.waitForTimeout(3500);
  const t1=await api();
  const dom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,110):null;}, mid);
  return {mid, t0, clicked, t1, dom};
};
