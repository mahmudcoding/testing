const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/members', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const rows = await page.evaluate(`(() => { const vis = ${VIS};
    const btns=[...document.querySelectorAll('button[aria-label^="Remove "]')].filter(vis);
    return btns.map(b => { let row=b.parentElement;
      for(let i=0;i<6&&row;i++){ if((row.innerText||'').split('\\n').length>=2 && row.querySelectorAll('button').length<=3) { const t=(row.innerText||'').trim(); if(t.length>6&&t.length<200) break; } row=row.parentElement; }
      const controls=[...row.querySelectorAll('button,a,select,[role=combobox],[role=switch]')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\\s+/g,' ').slice(0,40));
      return { text:(row.innerText||'').replace(/\\n/g,' | ').slice(0,120), controls, disabled:b.disabled }; }).slice(0,4); })()`);
  // open the Remove dialog for the least-used account, do NOT confirm
  const target = page.locator('button[aria-label="Remove QA Outsider from the company"]').first();
  let dialog = null;
  if (await target.count()) {
    await target.scrollIntoViewIfNeeded(); await target.click(); await page.waitForTimeout(2200);
    dialog = await page.evaluate(`(() => { const vis = ${VIS};
      const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vis)[0];
      if(!d) return '(no dialog)';
      return { text:(d.innerText||'').replace(/\\n/g,' | ').slice(0,300),
        buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean) }; })()`);
    // close without confirming
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  }
  const stillThere = await page.locator('button[aria-label="Remove QA Outsider from the company"]').count();
  return { rowSample: rows, removeDialog: dialog, targetStillPresentAfterEscape: stillThere };
};
