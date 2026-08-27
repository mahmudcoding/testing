const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .filter(tr=>[...tr.querySelectorAll('td')].some(td=>/^Pending$/i.test((td.innerText||'').trim())))
      .map(tr=>({ cells:[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').trim().slice(0,24)),
                  buttons:[...tr.querySelectorAll('button')].filter(vis).map(b=>({
                    t:(b.innerText||'').trim().slice(0,20), dis:b.disabled,
                    testid:b.getAttribute('data-testid')||'' })) }));
    return rows; })()`);
  // click Revoke on the pending row, then describe whatever appears
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const tr=[...main.querySelectorAll('tr')].filter(vis)
      .filter(x=>[...x.querySelectorAll('td')].some(td=>/^Pending$/i.test((td.innerText||'').trim())))[0];
    const b=[...tr.querySelectorAll('button')].filter(vis).filter(x=>/Revoke/i.test(x.innerText||''))[0];
    if(b) b.click(); })()`);
  await page.waitForTimeout(2200);
  const dialog = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vis);
    return { dialogs: dlg.length,
             text: dlg.length? (dlg[0].innerText||'').replace(/\\s+/g,' ').slice(0,220) : null,
             buttons: dlg.length? [...dlg[0].querySelectorAll('button')].filter(vis)
                 .map(b=>({ t:(b.innerText||'').trim().slice(0,24), testid:b.getAttribute('data-testid')||'' })) : [] }; })()`);
  return { pendingRowsBefore: before, dialogAfterRevokeClick: dialog };
};
