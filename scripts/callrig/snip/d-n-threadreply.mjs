export default async ({page}) => {
  const out={};
  const ta = page.locator('textarea[placeholder="Reply to message"]').first();
  out.found = await ta.count();
  if(!out.found) return out;
  await ta.click(); await ta.fill(''); await ta.type(process.env.QA_TEXT||'reply',{delay:15});
  await page.waitForTimeout(300);
  out.typed = await ta.inputValue();
  await page.locator('button', {hasText:/^Send reply$/}).first().click();
  await page.waitForTimeout(3500);
  out.dlg = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].find(x=>/Message thread/.test(x.innerText||''));
    return d? {full:(d.innerText||'').replace(/\s+/g,' '), btns:[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean)} : null;});
  return out;
};
