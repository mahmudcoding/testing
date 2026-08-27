export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const base = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    return { rows:[...main.querySelectorAll('[role=row],tbody tr,li')].filter(vis).length,
      buttons:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,18) };
  });
  // open the row menu for another member, if one exists
  const menus = await page.$$('main button[aria-haspopup], main [role=row] button, main li button');
  let opened=null;
  for (const m of menus.slice(0,10)) {
    const al = await m.getAttribute('aria-label').catch(()=>null);
    if (al && /more|option|menu|action/i.test(al)) { await m.click().catch(()=>{}); await page.waitForTimeout(1400); opened=al; break; }
  }
  const menu = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=menuitem],[role=option]')].filter(vis).map(x=>(x.innerText||'').trim().replace(/\s+/g,' ')).slice(0,14);
  });
  return { ...base, openedMenu: opened, menuItems: menu,
    removeLike: [...base.buttons, ...menu].filter(x=>/remove|kick/i.test(x)) };
};
