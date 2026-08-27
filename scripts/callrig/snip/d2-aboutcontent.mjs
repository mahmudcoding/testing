const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/about', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis = ${VIS};
    // the content region = the settings pane, excluding the settings nav list
    const nav = document.querySelector('nav[aria-label], aside');
    const main = document.querySelector('main') || document.body;
    const inNav = el => nav && nav.contains(el);
    const all = [...main.querySelectorAll('a,button,[role=button],[role=switch],input,select')].filter(vis).filter(e => !inNav(e));
    const items = all.map(e => ({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
      label:(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\\s+/g,' ').slice(0,44),
      href:(e.getAttribute('href')||'').slice(0,70) }));
    const txt = (main.innerText||'');
    const idx = txt.indexOf('About Aloqa');
    const contentText = (idx >= 0 ? txt.slice(idx) : txt).replace(/\\n+/g,' | ').slice(0,420);
    return { interactiveOutsideNav: items, count: items.length, contentText,
      mentions: { licence: /licen[cs]e/i.test(txt), help: /help|support|contact/i.test(txt),
                  terms: /terms|privacy policy/i.test(txt) } }; })()`);
};
