export default async ({page}) => {
  const id = process.env.QA_CH || 'C4QBGENERAL0001';
  const mid = process.env.QA_MID;
  const add = process.env.QA_ADD || ' EDITED1';
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
  }
  const before = await page.evaluate((mid)=> {
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    return a ? (a.innerText||'').replace(/\s+/g,' ').slice(0,120) : null;
  }, mid);
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(1800);
  const moreH = await page.evaluateHandle((mid) => {
    const a = document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].find(b => /more/i.test(b.getAttribute('aria-label')||'')) || null;
  }, mid);
  const more = moreH.asElement();
  if (!more) return {err:'no more button', before};
  await more.click(); await page.waitForTimeout(900);
  const ok = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role=menuitem]')].find(b => /^edit/i.test((b.innerText||'').trim()));
    if (!el) return false; el.click(); return true;
  });
  if (!ok) return {err:'no Edit item', before};
  await page.waitForTimeout(1500);
  // find the in-message editor
  const h = await page.evaluateHandle((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    return [...document.querySelectorAll('div[contenteditable="true"]')].find(e=>a&&a.contains(e)) || null;
  }, mid);
  const ed = h.asElement();
  if (!ed) return {err:'no in-message editor', before};
  await ed.click();
  await page.keyboard.press('End');
  await page.keyboard.type(add, {delay: 20});
  await page.waitForTimeout(400);
  const typed = await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    const e=[...document.querySelectorAll('div[contenteditable="true"]')].find(x=>a&&a.contains(x));
    return e ? (e.innerText||'').slice(0,120) : null;
  }, mid);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const after = await page.evaluate((mid)=> {
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    return {dom: a ? (a.innerText||'').replace(/\s+/g,' ').slice(0,140) : null,
            stillEditing: !!(a && [...document.querySelectorAll('div[contenteditable="true"]')].some(e=>a.contains(e)))};
  }, mid);
  const api = await page.evaluate(async (mid) => {
    const r = await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=15',{credentials:'include'});
    const j = await r.json();
    const m = (j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    return m ? {body:(m.body||'').slice(0,120), edited_at:m.edited_at||null, is_edited:m.is_edited??null} : {notfound:true};
  }, mid);
  return {mid, before, typed, after, api};
};
