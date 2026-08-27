export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const snap = () => page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const tabs = [...document.querySelectorAll('button')].filter(v)
      .filter(b=>/^(All|Group meetings|1-to-1)·/.test(b.textContent.trim()))
      .map(b=>({t:b.textContent.trim().replace(/\s+/g,' '), sel:b.getAttribute('aria-selected')}));
    const rows = [...document.querySelectorAll('button')].filter(v)
      .filter(e=>/·\s*(Ended|Declined|No answer|Canceled|Missed)/i.test(e.innerText||'')
                 && (e.innerText||'').length < 140);
    const lm = [...document.querySelectorAll('button')].filter(v).find(b=>/^Load more$/i.test(b.textContent.trim()));
    return { tabs, visibleRows: rows.length, hasLoadMore: !!lm,
             first: rows.slice(0,2).map(r=>r.innerText.replace(/\n+/g,' ').slice(0,58)) };
  });
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')]
    .find(e=>/^1-to-1·/.test(e.textContent.trim())); if (b) b.click(); });
  await page.waitForTimeout(2200);
  const onOpen = await snap();
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width>0)
    .find(e=>/^Load more$/i.test(e.textContent.trim())); if (b) b.click(); });
  await page.waitForTimeout(2500);
  return { tabSelected: onOpen, afterOneLoadMore: await snap() };
};
