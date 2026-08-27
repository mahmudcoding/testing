export default async ({ page }) => {
  const who = process.env.QA_INVITE || 'QA Bob';
  return await page.evaluate((who) => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const rows = [...document.querySelectorAll('label,li,div')].filter(v)
      .filter(e=>(e.innerText||'').includes(who) && (e.innerText||'').length < 90
                 && !!e.querySelector('input[type=checkbox]'));
    const r = rows[rows.length-1];
    if (!r) return 'ROW-NOT-FOUND';
    const cb = r.querySelector('input[type=checkbox]');
    return { text: r.innerText.replace(/\n+/g,' ').trim().slice(0,60), disabled: cb.disabled, checked: cb.checked };
  }, who);
};
