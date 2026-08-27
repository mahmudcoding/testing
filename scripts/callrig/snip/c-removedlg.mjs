export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.locator('button[aria-label="Participants"]').first().click();
  await page.waitForTimeout(2000);
  out.panel = await page.evaluate(()=>({txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(-600)}));
  const pa = page.locator('button[aria-label^="Participant actions for QA Bob"]').first();
  if (!(await pa.count())) { out.err='no participant actions for bob';
    out.labels = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,40));
    return out; }
  await pa.click(); await page.waitForTimeout(1500);
  out.menu = await page.evaluate(()=>[...document.querySelectorAll('[role="menuitem"],button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(l=>/remove|ban|mute|host|hold|spotlight|pin|permission/i.test(l)).slice(0,15));
  const rm = page.locator('[role="menuitem"], button', {hasText:/^Remove from call$/}).first();
  if (await rm.count()) { await rm.click(); await page.waitForTimeout(1500); }
  out.dialog = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,400), btns:[...d.querySelectorAll('button')].map(b=>(b.textContent||'').trim())} : null;
  });
  // cancel out
  await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop(); if(d){const c=[...d.querySelectorAll('button')].find(b=>/cancel/i.test(b.textContent||'')); if(c)c.click();}});
  await page.waitForTimeout(800);
  // toolbar labels for BUG-19 / BUG-21 enumeration
  out.toolbar = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getAttribute('aria-label')).filter(Boolean));
  out.lockSearch = await page.evaluate(()=>{
    const txt=(document.body.innerText||'');
    return {lockInText: /lock/i.test(txt), matches:(txt.match(/[^\n]*lock[^\n]*/gi)||[]).slice(0,5)};
  });
  return out;
};
