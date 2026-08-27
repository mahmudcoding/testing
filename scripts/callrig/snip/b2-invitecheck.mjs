export default async ({ page }) => {
  const who = process.env.QA_INVITE || 'QA Bob';
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-add-to-call"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const picked = await page.evaluate((who) => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const dlg = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    if (!dlg) return 'no-dialog';
    const rows = [...dlg.querySelectorAll('label,li,div')].filter(v)
      .filter(e=>(e.innerText||'').includes(who) && (e.innerText||'').length < 80);
    const row = rows[rows.length-1]; if (!row) return 'no-row';
    const cb = row.querySelector('input[type=checkbox]') || row;
    cb.click(); return 'picked';
  }, who);
  await page.waitForTimeout(1200);
  const sent = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('[role="dialog"] button')].filter(v)
      .find(x=>/^Invite \(\d+\)$/.test((x.innerText||'').trim()));
    if (!b || b.disabled) return b ? 'disabled' : 'no-button';
    const t = b.innerText.trim(); b.click(); return t;
  });
  await page.waitForTimeout(3000);
  return { picked, sent, row: await page.evaluate((who) => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const rows = [...document.querySelectorAll('[role="dialog"] label,[role="dialog"] li,[role="dialog"] div')]
      .filter(v).filter(e=>(e.innerText||'').includes(who) && (e.innerText||'').length < 90);
    const r = rows[rows.length-1];
    const cb = r ? r.querySelector('input[type=checkbox]') : null;
    return r ? { text: r.innerText.replace(/\n+/g,' ').trim().slice(0,60), disabled: cb ? cb.disabled : null } : null;
  }, who) };
};
