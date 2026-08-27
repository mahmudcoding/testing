export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, emo=process.env.QA_EMO||'😀';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const net=[];
  page.on('request', r=>{ const u=r.url(); if(/react/i.test(u)) net.push({phase:'req', m:r.method(), u:u.replace(/^https:\/\/[^/]+/,''), body:(r.postData()||'').slice(0,120)}); });
  page.on('response', async r=>{ const u=r.url(); if(/react/i.test(u)) net.push({phase:'res', s:r.status(), u:u.replace(/^https:\/\/[^/]+/,'')}); });
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji||r.name||r.reaction, c:r.count??(r.user_ids||[]).length}));
  }, mid);
  const t0 = await api();
  // PATH 1: click the chip
  const chipInfo = await page.evaluate(({mid,emo})=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>(x.innerText||'').includes(emo));
    if(!b) return {err:'no chip'};
    const r=b.getBoundingClientRect(); const cx=r.x+r.width/2, cy=r.y+r.height/2;
    const hit=document.elementFromPoint(cx,cy);
    return {label:b.getAttribute('aria-label'), text:(b.innerText||'').replace(/\s+/g,' ').trim(),
            cx:Math.round(cx), cy:Math.round(cy),
            hitOk: hit===b||b.contains(hit), hitTag: hit?hit.tagName:null};
  }, {mid, emo});
  if(!chipInfo.err){ await page.mouse.move(chipInfo.cx, chipInfo.cy); await page.waitForTimeout(250);
    await page.mouse.click(chipInfo.cx, chipInfo.cy); await page.waitForTimeout(3000); }
  const t1 = await api(); const net1=[...net]; net.length=0;
  // PATH 2: reopen picker, click same emoji again
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1500);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/reaction/i.test(x.getAttribute('aria-label')||''))?.click();}, mid);
  await page.waitForTimeout(1500);
  const picked = await page.evaluate((emo)=>{
    const b=[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();
      return r.width>0&&r.height>0&&(b.innerText||'').trim()===emo;})[0];
    if(!b) return false; b.click(); return true;
  }, emo);
  await page.waitForTimeout(3000);
  const t2 = await api();
  await page.keyboard.press('Escape');
  const dom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,120):null;}, mid);
  return {mid, t0, chipInfo, t1, net_chip:net1, pickerReclick:picked, t2, net_picker:net, dom};
};
