export default async ({page}) => {
  const reqs = [];
  page.on('request', r => { const u=r.url(); if (u.includes('meetings/history')) reqs.push(u.replace('https://airion-cargo.store','')); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const snap = async () => await page.evaluate(() => {
    const m = document.querySelector('main');
    const rows = [...m.querySelectorAll('button')].filter(b=>/Outbound|Incoming/.test(b.textContent)).map(b=>b.textContent.trim().replace(/\s+/g,' ').slice(0,60));
    const counts = [...m.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(t=>/^(All|Group meetings|1-to-1)·/.test(t.replace(/\s+/g,'')));
    return {n: rows.length, uniq: new Set(rows).size, counts, hasLoadMore: [...m.querySelectorAll('button')].some(b=>/Load more/i.test(b.textContent)), first: rows[0], last: rows[rows.length-1]};
  });
  const s0 = await snap();
  const out = [s0];
  for (let i=0;i<4;i++) {
    const btn = page.locator('main button', {hasText: 'Load more'}).first();
    if (!(await btn.count())) break;
    await btn.click();
    await page.waitForTimeout(2500);
    out.push(await snap());
  }
  return {requests: reqs, steps: out};
};
