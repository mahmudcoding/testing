export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, add=process.env.QA_ADD||' EDITED-X1';
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
  }
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1600);
  await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(b=>/more/i.test(b.getAttribute('aria-label')||''))?.click();
  }, mid);
  await page.waitForTimeout(900);
  await page.evaluate(()=>{[...document.querySelectorAll('[role=menuitem]')].find(b=>/^edit/i.test((b.innerText||'').trim()))?.click();});
  await page.waitForTimeout(1600);
  const loaded = await page.evaluate((s)=>document.querySelector(s)?.innerText||'', sel);
  // any "editing" affordance visible?
  const affordance = await page.evaluate(()=> {
    const t=(document.body.innerText||'');
    return {hasEditingWord: /editing|edit message/i.test(t.slice(0,4000)),
      cancelBtns: [...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&/cancel|close/i.test((b.getAttribute('aria-label')||b.innerText||''));}).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30))};
  });
  await page.click(sel);
  await page.keyboard.press('End');
  await page.keyboard.type(add,{delay:20});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const after = await page.evaluate(({mid,s})=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    const all=[...document.querySelectorAll('[data-message-id]')];
    return {target: a?(a.innerText||'').replace(/\s+/g,' ').slice(0,140):null,
            count: all.length,
            last: all.slice(-2).map(m=>m.getAttribute('data-message-id')+'|'+(m.innerText||'').replace(/\s+/g,' ').slice(0,80)),
            composer:(document.querySelector(s)?.innerText||'').slice(0,60)};
  }, {mid, s: sel});
  const api = await page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    const m=arr.find(x=>x.id===mid);
    return {total:arr.length, target: m?{body:(m.body||'').slice(0,120), edited_at:m.edited_at||null, is_edited:m.is_edited??null, updated_at:m.updated_at||null, created_at:m.created_at||null}:{notfound:true}};
  }, mid);
  return {mid, loaded, affordance, after, api};
};
