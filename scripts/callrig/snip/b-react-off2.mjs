export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, emo=process.env.QA_EMO||'😀';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji, c:r.count, users:(r.user_ids||[]).length}));
  }, mid);
  const t0 = await api();
  const net=[];
  page.on('request', r=>{const u=r.url(); if(/react/i.test(u)) net.push({m:r.method(), u:u.replace(/^https:\/\/[^/]+/,'').slice(0,80), b:(r.postData()||'').slice(0,60)});});
  page.on('response', r=>{const u=r.url(); if(/react/i.test(u)) net.push({s:r.status(), u:u.replace(/^https:\/\/[^/]+/,'').slice(0,80)});});
  // hover + open picker, with retries
  let picker=null;
  for(let att=0; att<3 && !(picker&&picker.n); att++){
    const art = await page.$(`[data-message-id="${mid}"]`);
    await art.hover().catch(()=>{});
    await page.waitForTimeout(1500+att*700);
    await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
      const b=[...a.querySelectorAll('button')].find(x=>/reaction/i.test(x.getAttribute('aria-label')||''));
      b&&b.click();}, mid);
    await page.waitForTimeout(1800+att*700);
    picker = await page.evaluate((emo)=>{
      const all=[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();
        const t=(b.innerText||'').trim();
        return r.width>0&&r.height>0&&t.length>0&&t.length<=4&&/\p{Extended_Pictographic}/u.test(t);});
      const same=all.filter(b=>(b.innerText||'').trim()===emo);
      return {n:all.length, sameN:same.length, att:true,
        target: same[0]?{x:Math.round(same[0].getBoundingClientRect().x+same[0].getBoundingClientRect().width/2),
                         y:Math.round(same[0].getBoundingClientRect().y+same[0].getBoundingClientRect().height/2),
                         pressed:same[0].getAttribute('aria-pressed'), label:same[0].getAttribute('aria-label')}:null};
    }, emo);
    if(!(picker&&picker.n)) { await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(600); }
  }
  let clicked=null;
  if(picker&&picker.target){ await page.mouse.move(picker.target.x,picker.target.y); await page.waitForTimeout(250);
    await page.mouse.click(picker.target.x,picker.target.y); clicked=picker.target; await page.waitForTimeout(3500); }
  const t1 = await api();
  const dom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,110):null;}, mid);
  return {mid, t0, picker, clicked, t1, net, dom};
};
