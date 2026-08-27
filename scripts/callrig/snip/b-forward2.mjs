export default async ({page}) => {
  const mid=process.env.QA_MID;
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const art = await page.$(`[data-message-id="${mid}"]`);
  if(!art) return {err:'msg not visible'};
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/^forward$/i.test((x.getAttribute('aria-label')||'').trim()))?.click();}, mid);
  await page.waitForTimeout(2500);
  // select qa-private under CHANNELS then Continue
  const sel1 = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    const cands=[...d.querySelectorAll('button,li,[role=option]')].filter(b=>b.getBoundingClientRect().width>0
      && /qa-private/.test((b.getAttribute('aria-label')||b.innerText||'')));
    const b=cands[cands.length-1]; if(!b) return null; b.click();
    return (b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,24);
  });
  await page.waitForTimeout(1200);
  const cont = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    const st=(d.innerText||'').match(/\d+ selected/)?.[0]||null;
    const b=[...d.querySelectorAll('button')].find(x=>/^(continue|forward|send)$/i.test((x.innerText||'').trim()));
    if(b) b.click(); return {state:st, clicked:!!b};
  });
  await page.waitForTimeout(3000);
  const after = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return {dialogClosed:true};
    const b=[...d.querySelectorAll('button')].find(x=>/^(send|forward)$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return {second:(b.innerText||'').trim()}; }
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,150)};
  });
  await page.waitForTimeout(3500);
  // read the forwarded card in qa-private
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBPRIVATE0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const card = await page.evaluate(()=>{
    const a=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
    return a?{text:(a.innerText||'').replace(/\s+/g,' ').slice(0,160), hasBackslash:/\\/.test(a.innerText||'')}:null;
  });
  return {sel1, cont, after, card};
};
