export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const read = () => page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const tabs = [...document.querySelectorAll('[role="tab"],button')].filter(v)
      .filter(b=>/^(All|Group|1-to-1|One-to-one|Direct|Group meetings)$/i.test(b.textContent.trim()))
      .map(b=>({t:b.textContent.trim(), sel:b.getAttribute('aria-selected')||b.getAttribute('data-state')}));
    const rows = [...document.querySelectorAll('button,li')].filter(v)
      .filter(e=>/·\s*(Ended|Declined|No answer|Canceled|Missed)/i.test(e.innerText||''));
    const loadMore = [...document.querySelectorAll('button')].filter(v)
      .find(b=>/^Load more$/i.test(b.textContent.trim()));
    return { tabs, rowCount: rows.length, hasLoadMore: !!loadMore,
             sample: rows.slice(0,2).map(r=>r.innerText.replace(/\n+/g,' ').slice(0,60)) };
  });
  return { initial: read ? await read() : null, _read: true };
};
