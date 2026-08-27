export default async ({page}) => {
  const msg = page.locator('[data-message-id]').last();
  const id = await msg.getAttribute('data-message-id');
  await msg.hover(); await page.waitForTimeout(700);
  await page.locator('button[aria-label="Forward"]').last().click();
  await page.waitForTimeout(2000);
  const dlg = page.locator('[role=dialog]').last();
  const n = await page.locator('[role=dialog]').count();
  if(!n) return {err:'no dialog', id};
  const txt = (await dlg.innerText()).slice(0,600);
  const btns = await dlg.evaluate(d => [...d.querySelectorAll('button')]
     .filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
     .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,40)));
  const inputs = await dlg.evaluate(d => [...d.querySelectorAll('input,textarea,[contenteditable="true"]')]
     .map(e=>({tag:e.tagName, ph:e.getAttribute('placeholder')||e.getAttribute('aria-label')||''})));
  return {id, dialogText: txt, buttons: btns.slice(0,30), inputs};
};
