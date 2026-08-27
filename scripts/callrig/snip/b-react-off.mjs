export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, emo=process.env.QA_EMO||'😀';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const net=[];
  page.on('request', r=>{const u=r.url(); if(/react/i.test(u)) net.push({m:r.method(), u:u.replace(/^https:\/\/[^/]+/,''), b:(r.postData()||'').slice(0,90)});});
  page.on('response', r=>{const u=r.url(); if(/react/i.test(u)) net.push({s:r.status(), u:u.replace(/^https:\/\/[^/]+/,'')});});
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji||r.name||r.reaction, c:r.count??(r.user_ids||[]).length}));
  }, mid);
  const t0 = await api();
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1800);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/reaction/i.test(x.getAttribute('aria-label')||''))?.click();}, mid);
  await page.waitForTimeout(2000);
  const pickerState = await page.evaluate((emo)=>{
    const cands=[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();
      return r.width>0&&r.height>0&&(b.innerText||'').trim()===emo;});
    return {found:cands.length, info:cands.map(b=>({label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'),
      cls:(b.className||'').slice(0,80), x:Math.round(b.getBoundingClientRect().x+b.getBoundingClientRect().width/2),
      y:Math.round(b.getBoundingClientRect().y+b.getBoundingClientRect().height/2)}))};
  }, emo);
  let clicked=null;
  if(pickerState.found){ const p=pickerState.info[0];
    await page.mouse.move(p.x,p.y); await page.waitForTimeout(200); await page.mouse.click(p.x,p.y); clicked=p; }
  await page.waitForTimeout(3500);
  const t1 = await api();
  const dom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,120):null;}, mid);
  return {mid, t0, pickerState, clicked, t1, net, dom};
};
