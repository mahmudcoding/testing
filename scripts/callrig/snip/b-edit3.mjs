export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID, add=process.env.QA_ADD||' E1';
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const bodyOf = async () => page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=20',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]); const m=arr.find(x=>x.id===mid);
    return {n:arr.length, body:m?(m.body||''):null, edited_at:m?(m.edited_at||null):null, updated_at:m?(m.updated_at||null):null};
  }, mid);
  const t0 = await bodyOf();
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1600);
  await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(b=>/more/i.test(b.getAttribute('aria-label')||''))?.click();}, mid);
  await page.waitForTimeout(900);
  await page.evaluate(()=>{[...document.querySelectorAll('[role=menuitem]')].find(b=>/^edit/i.test((b.innerText||'').trim()))?.click();});
  await page.waitForTimeout(1800);
  const loaded = await page.evaluate((s)=>document.querySelector(s)?.innerText||'', sel);
  await page.click(sel); await page.keyboard.press('End');
  await page.keyboard.type(add,{delay:20}); await page.waitForTimeout(500);
  const beforeEnter = await page.evaluate((s)=>document.querySelector(s)?.innerText||'', sel);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const t1 = await bodyOf();
  const afterEnter = await page.evaluate((s)=>({
     composer:document.querySelector(s)?.innerText||'',
     stillEditing: [...document.querySelectorAll('button')].some(b=>/save changes/i.test(b.getAttribute('aria-label')||''))
  }), sel);
  // now click Save changes
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(b=>/save changes/i.test(b.getAttribute('aria-label')||''));
    if(!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(3000);
  const t2 = await bodyOf();
  const afterSave = await page.evaluate((s)=>({
     composer:document.querySelector(s)?.innerText||'',
     stillEditing: [...document.querySelectorAll('button')].some(b=>/save changes/i.test(b.getAttribute('aria-label')||''))
  }), sel);
  const dom = await page.evaluate((mid)=>{const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,140):null;}, mid);
  return {mid, t0, loaded, beforeEnter, t1_afterEnter:t1, afterEnter, savedClicked:clicked, t2_afterSave:t2, afterSave, dom};
};
