export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, emo='😀';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const who = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'}).then(r=>r.json()));
    return (j?.data?.username||j?.username||j?.data?.email||'?');
  });
  const rx = await page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=10',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji,c:r.count,users:r.user_ids||[]}));
  }, mid);
  const art = await page.$(`[data-message-id="${mid}"]`);
  if(!art) return {who, err:'msg not visible', rx};
  await art.hover().catch(()=>{});
  await page.waitForTimeout(1600);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/^add reaction$/i.test((x.getAttribute('aria-label')||'').trim()))?.click();}, mid);
  await page.waitForTimeout(2200);
  const picker = await page.evaluate((emo)=>{
    const all=[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();
      const t=(b.innerText||'').trim();
      return r.width>0&&r.height>0&&t.length>0&&t.length<=4&&/\p{Extended_Pictographic}/u.test(t);});
    return {emojiButtons:all.length, hasTarget:all.some(b=>(b.innerText||'').trim()===emo)};
  }, emo);
  const toolbar = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.getAttribute('aria-label')||'').trim().slice(0,26));}, mid);
  return {who, rx, toolbar, picker};
};
