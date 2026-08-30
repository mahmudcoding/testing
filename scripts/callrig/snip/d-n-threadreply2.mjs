export default async ({page}) => {
  const out={};
  const c = page.locator('[role=dialog] button[aria-label="Close"]').last();
  if (await c.count()>0 && await c.isVisible().catch(()=>false)){ const b=await c.boundingBox(); if(b){await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(1200);} }
  const idx=+(process.env.QA_IDX||0);
  out.parent = await page.evaluate((i)=>{const rows=[...document.querySelectorAll('[data-testid="ic-user-message"]')];
    return rows[i]?(rows[i].innerText||'').replace(/\s+/g,' ').slice(0,120):null;}, idx);
  await page.locator('[data-testid="in-call-chat-panel"] button', {hasText:/^Thread$/}).nth(idx).click();
  await page.waitForTimeout(2500);
  const ta = page.locator('textarea[placeholder="Reply to message"]').first();
  out.taDis = await ta.isDisabled();
  if (out.taDis) return out;
  await ta.click(); await ta.fill(''); await ta.type(process.env.QA_TEXT||'reply',{delay:15});
  await page.waitForTimeout(300);
  await page.locator('button', {hasText:/^Send reply$/}).first().click();
  await page.waitForTimeout(3500);
  out.dlg = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role=dialog]')].find(x=>/Message thread/.test(x.innerText||''));
    return d?(d.innerText||'').replace(/\s+/g,' '):null;});
  return out;
};
