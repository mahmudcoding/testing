export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  // find the row containing `who` and click its actions button
  const res = await page.evaluate((who)=>{
    const panel=document.querySelector('[data-testid="participants-list-panel"]');
    if(!panel) return {err:'no panel'};
    const rows=[...panel.querySelectorAll('li,[role="listitem"],div')].filter(e=>e.innerText && e.innerText.includes(who) && e.querySelector('button[aria-label="Participant actions"]'));
    if(!rows.length) return {err:'no row for '+who, panelText: panel.innerText.replace(/\n+/g,' | ').slice(0,300)};
    const row=rows[rows.length-1];
    const b=row.querySelector('button[aria-label="Participant actions"]');
    b.setAttribute('data-qa-target','1');
    return {ok:true, rowText: row.innerText.replace(/\n+/g,' | ').slice(0,120)};
  }, who);
  if (res.err) return res;
  await page.click('[data-qa-target="1"]');
  await page.waitForTimeout(2000);
  const menu = await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="menu"],[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded' && m.getAttribute('data-testid')!=='participants-list-panel');
    const m=ms[ms.length-1];
    return m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,300), items:[...m.querySelectorAll('button,[role="menuitem"]')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40), t:e.getAttribute('data-testid')}))}:{none:true};
  });
  return {row: res.rowText, menu};
};
