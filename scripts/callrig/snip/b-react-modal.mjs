export default async ({page}) => {
  const mid=process.env.QA_MID, emo=process.env.QA_EMO||'😀';
  const modal = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0);
    return d.map(x=>({text:(x.innerText||'').replace(/\s+/g,' ').slice(0,200),
      btns:[...x.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>((b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24)))}));
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await page.evaluate(()=>{document.querySelectorAll('.aloqa-modal-backdrop').forEach(e=>e.remove());});
  await page.waitForTimeout(500);
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return (m?.reactions||[]).map(r=>({e:r.emoji||r.name||r.reaction, c:r.count??(r.user_ids||[]).length}));
  }, mid);
  const t0 = await api();
  const net=[];
  page.on('request', r=>{const u=r.url(); if(/react/i.test(u)) net.push({m:r.method(), u:u.replace(/^https:\/\/[^/]+/,''), b:(r.postData()||'').slice(0,100)});});
  page.on('response', r=>{const u=r.url(); if(/react/i.test(u)) net.push({s:r.status(), u:u.replace(/^https:\/\/[^/]+/,'')});});
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover({timeout:8000}).catch(()=>{});
  await page.waitForTimeout(1500);
  const opened = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>/reaction/i.test(x.getAttribute('aria-label')||''));
    if(!b) return false; b.click(); return true;}, mid);
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
  return {modal, t0, openedPicker:opened, picked, t1, net, dom};
};
