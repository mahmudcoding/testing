const snap = () => {
  const m = document.querySelector('main') || document.body;
  const tabs = [...m.querySelectorAll('[role="tab"]')].map(t=>({l:t.textContent.trim(), sel:t.getAttribute('aria-selected')}));
  const items = [...m.querySelectorAll('li,[role="listitem"]')].map(e=>e.innerText.replace(/\n+/g,' · ').trim()).filter(t=>/Ended|Missed|Declined|Cancel/i.test(t));
  const btns = [...m.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(Boolean);
  return {tabs, count: items.length, items: items.slice(0,8), loadMore: btns.some(b=>/load more/i.test(b)), emptyText: (m.innerText.match(/No .{0,60}/g)||[]).slice(0,4)};
};
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const out = {fresh: await page.evaluate(snap)};
  const tab = await page.$('[role="tab"]:has-text("1-to-1")');
  if (!tab) return {...out, err:'no 1-to-1 tab'};
  await tab.click(); await page.waitForTimeout(1500);
  out.on121 = await page.evaluate(snap);
  for (let i=0;i<3;i++) {
    const lm = await page.$('button:has-text("Load more")');
    if (!lm) break;
    await lm.click(); await page.waitForTimeout(2200);
  }
  out.after3LoadMore = await page.evaluate(snap);
  return out;
};
