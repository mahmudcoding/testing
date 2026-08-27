export default async ({ page }) => {
  return await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
      let n = el, op = 1; while (n && n !== document.documentElement) { op *= parseFloat(getComputedStyle(n).opacity || '1'); n = n.parentElement; } return op > 0.05; };
    const navEl = document.querySelector('a[href*="/settings/"]')?.closest('nav,aside,[class*="sidebar"],[class*="nav"]');
    const groups = navEl ? [...navEl.querySelectorAll('*')].filter(e => vis(e) && e.children.length === 0 && e.innerText?.trim() && !e.closest('a'))
      .map(e => e.innerText.trim().slice(0,30)) : [];
    const links = [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a => (a.getAttribute('href')||'').split('/settings/')[1]);
    // hunt for a filter/search box scoped to the nav container
    const navBox = navEl ? [...navEl.querySelectorAll('input')].filter(vis).map(i=>({ph:i.placeholder,type:i.type})) : [];
    const allInputs = [...document.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,30),type:i.type,aria:(i.getAttribute('aria-label')||'').slice(0,30)}));
    return { navTag: navEl?.tagName+'.'+(navEl?.className||'').slice(0,40), groupTexts: groups.slice(0,25), links, navInputs: navBox, allInputCount: allInputs.length, allInputs: allInputs.slice(0,12) };
  });
};
