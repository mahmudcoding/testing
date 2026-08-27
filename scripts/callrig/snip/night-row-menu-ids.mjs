export default async ({page}) => {
  const idx=Number(process.env.QA_IDX);
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  await page.evaluate((idx)=>{
    document.querySelectorAll('[data-qa-idx]').forEach(e=>e.removeAttribute('data-qa-idx'));
    const panel=document.querySelector('[data-testid="participants-list-panel"]');
    const btns=[...panel.querySelectorAll('button[aria-label="Participant actions"]')];
    if(btns[idx]) btns[idx].setAttribute('data-qa-idx','1');
  }, idx);
  await page.click('[data-qa-idx="1"]');
  await page.waitForTimeout(2000);
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="menu"],[role="dialog"]')].filter(m=>!['call-overlay-expanded','participants-list-panel'].includes(m.getAttribute('data-testid')));
    const m=ms[ms.length-1];
    return m?[...m.querySelectorAll('button,[role="menuitem"]')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40), t:e.getAttribute('data-testid')})):[];
  });
};
