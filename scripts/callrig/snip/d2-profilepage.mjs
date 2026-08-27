export default async ({ page }) => {
  const vis = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const link = page.locator('a:has-text("Profile")').first();
  await link.scrollIntoViewIfNeeded(); await link.click();
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis = ${vis};
    const main = document.querySelector('main') || document.body;
    const heads = [...main.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>h.innerText.trim().slice(0,50));
    const ctrls = [...main.querySelectorAll('input,textarea,select,button,[role=switch],[contenteditable=true]')].filter(vis)
      .map(e=>({ t:e.tagName.toLowerCase(), lbl:(e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.innerText||'').trim().slice(0,40),
                 val:(e.value!==undefined?String(e.value):'').slice(0,40), dis:e.disabled===true }));
    const txt = main.innerText;
    return { path: location.pathname, heads, ctrls,
      shows: { phone:/998 90 123/.test(txt), linkedin:/qa-probe/.test(txt), github:/qa-probe/.test(txt), site:/example\\.org/.test(txt) } }; })()`);
};
