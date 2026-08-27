export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const vis = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;

  const rows = await page.evaluate(`(() => { const vis = ${vis};
    return [...document.querySelectorAll('main [role=row], main tr, main li, main [data-testid]')].filter(vis)
      .map(e => e.innerText.trim().replace(/\\s+/g,' ').slice(0,70)).filter(t => /Alice/i.test(t)).slice(0,5); })()`);

  const target = page.locator('main').getByText('QA Alice', { exact: false }).first();
  let opened = false;
  try { await target.scrollIntoViewIfNeeded(); await target.click(); opened = true; } catch (e) { opened = 'click failed: ' + e.message.slice(0,80); }
  await page.waitForTimeout(2500);

  const panel = await page.evaluate(`(() => { const vis = ${vis};
    const dlg = [...document.querySelectorAll('[role=dialog],[data-state=open],aside')].filter(vis)
      .sort((a,b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    if (!dlg) return { found: false, bodyHas: { phone: /998 90 123/.test(document.body.innerText), linkedin: /qa-probe/.test(document.body.innerText) } };
    const txt = dlg.innerText.trim().replace(/\\n{2,}/g,'\\n').slice(0,900);
    const btns = [...dlg.querySelectorAll('button,a')].filter(vis).map(b => (b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,20);
    return { found: true, text: txt, buttons: btns,
      has: { phone: /998 90 123/.test(txt), linkedin: /linkedin/i.test(txt), github: /github/i.test(txt), site: /example\\.org/.test(txt) } }; })()`);
  return { url: page.url().replace(/^https?:\/\/[^/]+/, ''), matchedRows: rows, opened, panel };
};
