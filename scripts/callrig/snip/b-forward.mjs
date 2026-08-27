export default async ({page}) => {
  const mid=process.env.QA_MID;
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const art = await page.$(`[data-message-id="${mid}"]`);
  if(!art) return {err:'msg not visible'};
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  const opened = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>/^forward$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return false; b.click(); return true;}, mid);
  await page.waitForTimeout(2500);
  const dlg = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,200),
      targets:[...d.querySelectorAll('button,li,[role=option]')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,28)).slice(0,10)};
  });
  return {mid, opened, dlg};
};
