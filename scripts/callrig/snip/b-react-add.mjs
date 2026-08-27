export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, emo=process.env.QA_EMO||'😀';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return j?.data?.username||j?.username||'?';});
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=30',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji,c:r.count,users:(r.user_ids||[]).length}));
  }, mid);
  const t0=await api();
  const art = await page.$(`[data-message-id="${mid}"]`);
  if(!art) return {who, err:'msg not visible', t0};
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  const openedPicker = await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>/^add reaction$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return false; b.click(); return true;}, mid);
  await page.waitForTimeout(2200);
  const pos = await page.evaluate((emo)=>{
    const b=[...document.querySelectorAll('button')].filter(x=>{const r=x.getBoundingClientRect();
      return r.width>0&&r.height>0&&(x.innerText||'').trim()===emo;})[0];
    if(!b) return null; const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};
  }, emo);
  if(pos){ await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(3500); }
  const t1=await api();
  const dom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,110):null;}, mid);
  return {who, t0, openedPicker, clicked:!!pos, t1, dom};
};
