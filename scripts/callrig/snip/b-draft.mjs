export default async ({page}) => {
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  // 1. type a draft, do not send
  await page.click(sel);
  await page.keyboard.type('DRAFT-do-not-lose-me',{delay:20});
  await page.waitForTimeout(600);
  const draft = await page.evaluate((s)=>document.querySelector(s)?.innerText||'', sel);
  // 2. click Edit on an own message
  const mid = await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')]
    .map(e=>e.getAttribute('data-message-id'))[0]);
  const art=await page.$(`[data-message-id="${mid}"]`);
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  await page.evaluate((m)=>{const a=document.querySelector(`[data-message-id="${m}"]`);
    [...a.querySelectorAll('button')].find(x=>/^more actions$/i.test((x.getAttribute('aria-label')||'').trim()))?.click();}, mid);
  await page.waitForTimeout(1200);
  const edited = await page.evaluate(()=>{const el=[...document.querySelectorAll('[role=menuitem]')]
    .find(b=>/^edit/i.test((b.innerText||'').trim())); if(!el) return null; el.click(); return 'Edit';});
  await page.waitForTimeout(1800);
  const inEdit = await page.evaluate((s)=>document.querySelector(s)?.innerText||'', sel);
  // 3. cancel editing — is the draft back?
  const cancelled = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')]
    .find(x=>/^cancel editing$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return null; b.click(); return 'Cancel editing';});
  await page.waitForTimeout(2200);
  const afterCancel = await page.evaluate((s)=>document.querySelector(s)?.innerText||'', sel);
  return {draft:draft.replace(/\s+/g,' ').trim(), mid, edited,
          inEdit:inEdit.replace(/\s+/g,' ').trim().slice(0,60), cancelled,
          afterCancel:afterCancel.replace(/\s+/g,' ').trim().slice(0,60),
          draftRestored: afterCancel.includes('DRAFT-do-not-lose-me')};
};
