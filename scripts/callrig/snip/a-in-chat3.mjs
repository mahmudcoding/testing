export default async ({page}) => {
  const sel = '[data-testid="call-side-panel-slot"] [contenteditable="true"]';
  // ensure chat panel open
  let ed = await page.$(sel);
  if (!ed) {
    await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-chat-toggle'); if(b)b.click();});
    await page.waitForTimeout(2500);
    ed = await page.$(sel);
  }
  if (!ed) return {err:'chat editor still absent'};
  const TXT = process.env.QA_TEXT || 'incall-check-3';
  await ed.click(); await page.waitForTimeout(300);
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Backspace');
  await page.keyboard.type(TXT,{delay:25}); await page.waitForTimeout(600);
  const typed = await page.evaluate((s)=>{const e=document.querySelector(s); return e?(e.innerText||'').trim():null;}, sel);
  await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('button')].find(x=>/^Send$/i.test(x.getAttribute('aria-label')||(x.textContent||'').trim())); if(b)b.click();});
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,320):null;});
  return {typed, after};
};
