export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const api = () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=30',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    return {n:arr.length, present: arr.some(x=>x.id===mid)};
  }, mid);
  const t0=await api();
  const domBefore = await page.evaluate((mid)=>!!document.querySelector(`[data-message-id="${mid}"]`), mid);
  const art = await page.$(`[data-message-id="${mid}"]`);
  if(!art) return {err:'msg not visible', t0};
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/^more actions$/i.test((x.getAttribute('aria-label')||'').trim()))?.click();}, mid);
  await page.waitForTimeout(1200);
  const clicked = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[role=menuitem]')].find(b=>/hide for me/i.test((b.innerText||'').trim()));
    if(!el) return null; el.click(); return (el.innerText||'').trim();
  });
  await page.waitForTimeout(2000);
  const dlg = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    const b=[...d.querySelectorAll('button')].find(x=>/^(hide|confirm|yes|ok)/i.test((x.innerText||'').trim()));
    const t=(d.innerText||'').replace(/\s+/g,' ').slice(0,140); if(b) b.click();
    return {text:t, confirmed:!!b};
  });
  await page.waitForTimeout(3000);
  const t1=await api();
  const domAfter = await page.evaluate((mid)=>!!document.querySelector(`[data-message-id="${mid}"]`), mid);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5500);
  const domReload = await page.evaluate((mid)=>!!document.querySelector(`[data-message-id="${mid}"]`), mid);
  const t2=await api();
  return {mid, t0, domBefore, clicked, dlg, t1, domAfter, t2, domReload};
};
