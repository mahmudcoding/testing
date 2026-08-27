export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const btns = await page.$$('[data-testid="participant-tile-card-trigger"]');
  let opened=null;
  for (const b of btns) {
    const l = await b.getAttribute('aria-label');
    if (l && l.includes(who)) { await b.click(); opened=l; break; }
  }
  await page.waitForTimeout(2000);
  const st = await page.evaluate(() => {
    const menus=[...document.querySelectorAll('[role="menu"],[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m = menus[menus.length-1];
    return m ? {role:m.getAttribute('role'), testid:m.getAttribute('data-testid'),
      text: m.innerText.replace(/\n+/g,' | ').slice(0,400),
      items: [...m.querySelectorAll('button,[role="menuitem"]')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40), t:e.getAttribute('data-testid'), d:e.disabled}))} : {none:true, all: menus.length};
  });
  return {opened, menu: st};
};
