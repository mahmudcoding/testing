export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const tb = document.querySelector('[data-testid="call-toolbar"]');
    const badge = document.querySelector('[data-testid="call-controls-waiting-count"]');
    const wrap = badge ? badge.parentElement : null;
    return {
      badgeSiblings: wrap ? [...wrap.children].map(c=>({ tag:c.tagName, tid:c.getAttribute('data-testid'),
        al:c.getAttribute('aria-label'), text:(c.innerText||'').trim().slice(0,24) })) : null,
      toolbarButtons: tb ? [...tb.querySelectorAll('button')].filter(v).map(b=>({
        tid:b.getAttribute('data-testid'), al:(b.getAttribute('aria-label')||'').slice(0,36),
        text:(b.innerText||'').replace(/\n+/g,' ').trim().slice(0,24) })) : null,
      anyRequestUi: [...document.querySelectorAll('button,[role="menuitem"],li')].filter(v)
        .filter(e=>/request|permission|allow|grant|approve|deny/i.test(
          (e.getAttribute('aria-label')||'') + ' ' + (e.innerText||'')))
        .map(e=>({ tid:e.getAttribute('data-testid'), al:e.getAttribute('aria-label'),
                   t:(e.innerText||'').replace(/\n+/g,' ').trim().slice(0,50) })).slice(0,10)
    };
  });
};
