export default async ({page}) => {
  const dom = await page.evaluate(()=>{
    return [...document.querySelectorAll('main [role="switch"]')].map(s=>{
      const lbl = s.getAttribute('aria-labelledby');
      const lblEl = lbl ? lbl.split(/\s+/).map(id=>document.getElementById(id)?.textContent?.trim()||`#${id}:MISSING`) : null;
      const wrap = s.closest('label');
      return {
        id: s.id||null,
        ariaLabel: s.getAttribute('aria-label'),
        ariaLabelledby: lbl, ariaLabelledbyText: lblEl,
        title: s.getAttribute('title'),
        textContent: (s.textContent||'').trim(),
        wrappedInLabel: !!wrap,
        labelForMatch: s.id ? !!document.querySelector(`label[for="${s.id}"]`) : false,
        ariaDescribedby: s.getAttribute('aria-describedby'),
        outer: s.outerHTML.slice(0,220),
        nearbyText: (s.parentElement?.parentElement?.innerText||'').replace(/\n+/g,' | ').slice(0,90)
      };
    });
  });
  // Playwright's accessible-name computation
  const names = [];
  const sw = await page.$$('main [role="switch"]');
  for (const s of sw) {
    let n = null;
    try { n = await s.evaluate(el=>el.ariaLabel); } catch(e){}
    names.push(n);
  }
  const snapshot = await page.locator('main').ariaSnapshot().catch(e=>'err '+e);
  return {dom, names, snapshotSwitches: String(snapshot).split('\n').filter(l=>/switch/i.test(l))};
};
