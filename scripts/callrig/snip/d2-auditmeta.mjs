export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.before = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const cells=[...main.querySelectorAll('td,[role=cell]')].filter(vis)
      .filter(c=>/^\{/.test((c.innerText||'').trim()));
    if(!cells.length) return {jsonCells:0};
    const c=cells[0];
    return { jsonCells:cells.length,
      text:(c.innerText||'').trim().slice(0,120),
      clipped: c.scrollWidth > c.clientWidth,
      scrollW:c.scrollWidth, clientW:c.clientWidth,
      title: c.getAttribute('title')||'(none)',
      hasButton: !!c.querySelector('button'),
      rowExpandable: !!c.closest('tr')?.querySelector('button[aria-expanded],[role=button]') };
  });
  // try clicking the first row to see if it expands
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const rows=[...document.querySelector('main').querySelectorAll('tbody tr')].filter(vis);
    if(!rows.length) return false; rows[0].click(); return true;
  });
  out.rowClicked = clicked;
  await page.waitForTimeout(2200);
  out.afterClick = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return { dialog: !!document.querySelector('[role=dialog]'),
      bodyLen: (document.querySelector('main')?.innerText||'').length };
  });
  return out;
};
