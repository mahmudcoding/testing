export default async ({ page }) => {
  const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.locator('button[aria-label="Open QA Alice\'s profile"]').first().click();
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis = ${VIS};
    const cands=[...document.querySelectorAll('[role=dialog],aside,[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(e=>/Alice/.test(e.innerText||'') && !/Search QA Workspace/.test(e.innerText||''));
    const dlg=cands.sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return (B.width*B.height)-(A.width*A.height);})[0];
    const txt = dlg ? (dlg.innerText||'').trim() : '(no panel)';
    return { panelText: txt.slice(0,450),
      finds: { timezone:/Tashkent|GMT|UTC|local time|\\+05/i.test(txt), clock:/\\b\\d{1,2}:\\d{2}\\s?(AM|PM)?\\b/i.test(txt),
               job:/QA Engineer/.test(txt), dept:/Quality/.test(txt), pron:/they\\/them/.test(txt), status:/Testing profile fields/.test(txt) } }; })()`);
};
