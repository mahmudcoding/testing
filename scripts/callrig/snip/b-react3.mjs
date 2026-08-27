export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, emo=process.env.QA_EMO||'😀';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return m?{reactions:(m.reactions||[]).map(r=>({e:r.emoji||r.name||r.reaction, c:r.count??(r.user_ids||[]).length}))}:{notfound:true};
  }, mid);
  const t0 = await api();
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1600);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/reaction/i.test(x.getAttribute('aria-label')||''))?.click();}, mid);
  await page.waitForTimeout(1500);
  const picked = await page.evaluate((emo)=>{
    const b=[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();
      return r.width>0&&r.height>0&&(b.innerText||'').trim()===emo;})[0];
    if(!b) return false; b.click(); return true;
  }, emo);
  await page.waitForTimeout(3000);
  const t1 = await api();
  const dom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,120):null;}, mid);
  // toggle off: click the reaction chip
  const chip = await page.evaluate(({mid,emo})=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`); if(!a) return false;
    const b=[...a.querySelectorAll('button')].find(x=>(x.innerText||'').includes(emo));
    if(!b) return false; b.click(); return true;
  }, {mid, emo});
  await page.waitForTimeout(2500);
  const t2 = await api();
  const dom2 = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,120):null;}, mid);
  return {mid, t0, picked, t1, dom, chipClicked:chip, t2, dom2};
};
