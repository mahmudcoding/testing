export default async ({page}) => {
  const TXT = process.env.QA_TEXT || 'incall-check';
  const sel = '[data-testid="call-side-panel-slot"] textarea, [data-testid="call-side-panel-slot"] input[type="text"], [data-testid="call-side-panel-slot"] input:not([type])';
  const el = await page.$(sel);
  if (!el) return {err:'no composer', tags: await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?[...p.querySelectorAll('input,textarea,[contenteditable]')].map(i=>i.tagName+':'+(i.getAttribute('aria-label')||i.type||'')):[];})};
  await el.click(); await page.waitForTimeout(250);
  await el.fill('');
  await el.type(TXT,{delay:20});
  await page.waitForTimeout(500);
  const typed = await page.evaluate((s)=>{const e=document.querySelector(s); return e?e.value:null;}, sel);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,320):null;});
  return {typed, after};
};
