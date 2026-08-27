export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, emo=process.env.QA_EMO||'😀';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji||r.name||r.reaction, c:r.count??(r.user_ids||[]).length, mine:r.reacted??r.me??r.is_mine??null}));
  }, mid);
  const t0 = await api();
  const info = await page.evaluate(({mid,emo})=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`); if(!a) return {err:'no msg'};
    const b=[...a.querySelectorAll('button')].find(x=>(x.innerText||'').includes(emo));
    if(!b) return {err:'no chip'};
    const r=b.getBoundingClientRect();
    return {tag:b.tagName, label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'),
            text:(b.innerText||'').replace(/\s+/g,' ').trim(), cls:(b.className||'').slice(0,90),
            rect:{x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), w:Math.round(r.width), h:Math.round(r.height)},
            hitsSelf: document.elementFromPoint(r.x+r.width/2, r.y+r.height/2)===b || b.contains(document.elementFromPoint(r.x+r.width/2, r.y+r.height/2))};
  }, {mid, emo});
  if (info.err) return {t0, info};
  // real mouse click at chip centre
  await page.mouse.move(info.rect.x, info.rect.y);
  await page.waitForTimeout(300);
  await page.mouse.click(info.rect.x, info.rect.y);
  const poll=[];
  for (let i=0;i<10;i++){ await page.waitForTimeout(600); poll.push({t:(i+1)*600, r: await api()}); }
  const dom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,120):null;}, mid);
  return {mid, t0, info, poll, dom};
};
