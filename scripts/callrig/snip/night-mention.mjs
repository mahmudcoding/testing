export default async ({page}) => {
  const t=page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  const ta=await page.$('[data-testid="in-call-chat-panel"] textarea');
  if(!ta) return {err:'no composer'};
  await ta.click();
  await ta.type('@', {delay:120});
  await page.waitForTimeout(2000);
  const afterAt=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="listbox"],[role="menu"],[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return {popup: m?m.innerText.replace(/\n+/g,' | ').slice(0,200):null,
      mentionIds:[...document.querySelectorAll('[data-testid*="mention" i]')].map(e=>e.getAttribute('data-testid'))};
  });
  await ta.type('QA', {delay:120});
  await page.waitForTimeout(2000);
  const afterName=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="listbox"],[role="menu"],[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return {popup: m?m.innerText.replace(/\n+/g,' | ').slice(0,200):null};
  });
  const val=await ta.inputValue();
  return {afterAt, afterName, composerValue: val};
};
