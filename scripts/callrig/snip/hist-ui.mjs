export default async ({page}) => {
  const reqs = [];
  page.on('request', r => { const u=r.url(); if (u.includes('meetings/history')) reqs.push(u.replace('https://airion-cargo.store','')); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const before = await page.evaluate(() => {
    const m = document.querySelector('main');
    const rows = [...m.querySelectorAll('button')].filter(b=>/Outbound|Incoming/.test(b.textContent));
    return {rows: rows.length, last: rows.length? rows[rows.length-1].textContent.trim().slice(0,80):null,
            scrollables: [...m.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+20).map(e=>({tag:e.tagName, cls:(e.className||'').toString().slice(0,40), sh:e.scrollHeight, ch:e.clientHeight})).slice(0,6)};
  });
  // scroll the window and any inner scroller to the bottom, repeatedly
  for (let i=0;i<6;i++) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      const m = document.querySelector('main');
      [...m.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+20).forEach(e=>{ e.scrollTop = e.scrollHeight; });
    });
    await page.waitForTimeout(1200);
  }
  const after = await page.evaluate(() => {
    const m = document.querySelector('main');
    const rows = [...m.querySelectorAll('button')].filter(b=>/Outbound|Incoming/.test(b.textContent));
    return {rows: rows.length, last: rows.length? rows[rows.length-1].textContent.trim().slice(0,80):null,
            loadMore: [...m.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(t=>/more|older|show|load/i.test(t)),
            tail: m.innerText.replace(/\n+/g,' | ').slice(-300)};
  });
  return {historyRequests: reqs, before, after};
};
