export default async ({page}) => {
  const idx = Number(process.env.QA_IDX);
  const item = process.env.QA_ITEM;
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  const info = await page.evaluate((idx)=>{
    const panel=document.querySelector('[data-testid="participants-list-panel"]');
    const btns=[...panel.querySelectorAll('button[aria-label="Participant actions"]')];
    const b=btns[idx]; if(!b) return {err:'no button at '+idx};
    document.querySelectorAll('[data-qa-idx]').forEach(e=>e.removeAttribute('data-qa-idx'));
    b.setAttribute('data-qa-idx','1');
    let n=b, txt=''; for(let k=0;k<6&&n;k++,n=n.parentElement){const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t&&t.length<60){txt=t;break;}}
    return {rowText: txt};
  }, idx);
  if (info.err) return info;
  await page.click('[data-qa-idx="1"]');
  await page.waitForTimeout(1800);
  const menuItems = await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="menu"],[role="dialog"]')].filter(m=>!['call-overlay-expanded','participants-list-panel'].includes(m.getAttribute('data-testid')));
    const m=ms[ms.length-1];
    return m?[...m.querySelectorAll('button,[role="menuitem"]')].map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40)):[];
  });
  if (item) {
    const el=page.locator('[data-testid="'+item+'"]');
    if (await el.count()) { await el.click(); await page.waitForTimeout(3000); }
    else return {rowText: info.rowText, menuItems, err:'item missing '+item};
  }
  const dlg = await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>!['call-overlay-expanded','participants-list-panel'].includes(m.getAttribute('data-testid')));
    const m=ms[ms.length-1];
    return m?m.innerText.replace(/\n+/g,' | ').slice(0,300):null;
  });
  return {rowText: info.rowText, menuItems, dialogText: dlg};
};
