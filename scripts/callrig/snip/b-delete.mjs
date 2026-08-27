export default async ({page}) => {
  const id='C4QBPRIVATE0001';
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const list = () => page.evaluate(async(id)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${id}/messages?limit=30`,{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    return {n:arr.length, ids:arr.map(m=>m.id), bodies:arr.slice(0,3).map(m=>(m.body||'').slice(0,36))};
  }, id);
  // send a throwaway message to delete
  await page.click(sel); await page.keyboard.type('QA-B-D1 delete target',{delay:15});
  await page.waitForTimeout(300); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const t0 = await list();
  const mid = t0.ids[0];
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1800);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(x=>/more/i.test(x.getAttribute('aria-label')||''))?.click();}, mid);
  await page.waitForTimeout(1200);
  const clicked = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[role=menuitem]')].find(b=>/^delete/i.test((b.innerText||'').trim()));
    if(!el) return null; el.click(); return (el.innerText||'').trim();
  });
  await page.waitForTimeout(1800);
  const dlg = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0);
    if(!d.length) return null;
    return {text:(d[0].innerText||'').replace(/\s+/g,' ').slice(0,160),
      btns:[...d[0].querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24))};
  });
  const confirmed = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0);
    if(!d.length) return false;
    const b=[...d[0].querySelectorAll('button')].find(b=>/^(delete|удалить|confirm|yes)/i.test((b.innerText||'').trim()));
    if(!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(3500);
  const t1 = await list();
  const domGone = await page.evaluate((mid)=>!document.querySelector(`[data-message-id="${mid}"]`), mid);
  return {mid, t0:{n:t0.n, top:t0.bodies[0]}, clicked, dlg, confirmed, t1:{n:t1.n, top:t1.bodies[0]}, domGone};
};
