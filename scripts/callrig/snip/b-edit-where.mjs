export default async ({page}) => {
  const id='C4QBGENERAL0001', mid=process.env.QA_MID;
  await page.keyboard.press('Escape').catch(()=>{});
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const snap = (tag) => page.evaluate((tag)=>({
    tag,
    editors: [...document.querySelectorAll('div[contenteditable="true"]')].map(e=>{
      const r=e.getBoundingClientRect();
      return {label:e.getAttribute('aria-label'), text:(e.innerText||'').slice(0,60),
        inMsgId: e.closest('[data-message-id]')?.getAttribute('data-message-id')||null,
        y:Math.round(r.y), h:Math.round(r.h||r.height), w:Math.round(r.width)};
    }),
    dialogs: [...document.querySelectorAll('[role=dialog]')].map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,100)),
    menus: [...document.querySelectorAll('[role=menu]')].length
  }), tag);
  const s0 = await snap('before');
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1800);
  const more = (await page.evaluateHandle((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].find(b=>/more/i.test(b.getAttribute('aria-label')||''))||null;
  }, mid)).asElement();
  if(!more) return {err:'no more', s0};
  await more.click({timeout:8000}).catch(async()=>{ await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    [...a.querySelectorAll('button')].find(b=>/more/i.test(b.getAttribute('aria-label')||''))?.click();
  }, mid); });
  await page.waitForTimeout(1000);
  const items = await page.evaluate(()=>[...document.querySelectorAll('[role=menuitem]')].map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()));
  await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[role=menuitem]')].find(b=>/^edit/i.test((b.innerText||'').trim()));
    el?.click();
  });
  await page.waitForTimeout(2000);
  const s1 = await snap('afterEditClick');
  return {mid, items, s0, s1};
};
