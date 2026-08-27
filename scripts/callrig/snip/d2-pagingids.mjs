export default async ({ page }) => {
  const pages=[];
  page.on('response', async r => { const u=r.url();
    if(!/admin\/audit-log/.test(u) || !u.includes('/api/')) return;
    let b=''; try{b=await r.text();}catch{}
    let j=null; try{j=JSON.parse(b);}catch{}
    const rows = Array.isArray(j)?j:((j&&j.entries)||[]);
    pages.push({ url:u.replace(/^https?:\/\/[^/]+/,'').slice(0,90), n:rows.length,
                 ids: rows.map(x=>x.id), first: rows[0]&&rows[0].created_at, last: rows[rows.length-1]&&rows[rows.length-1].created_at });
  });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  const next = page.locator('button:has-text("Next")').first();
  await next.scrollIntoViewIfNeeded(); await next.click(); await page.waitForTimeout(4500);
  const p1 = pages[0], p2 = pages[1];
  if (!p1 || !p2) return { err:'did not capture two pages', got: pages.map(p=>p.url) };
  const s1 = new Set(p1.ids), s2 = new Set(p2.ids);
  const shared = [...s1].filter(x=>s2.has(x));
  // what the TABLE shows after clicking Next
  const shown = await page.evaluate(() => {
    const rows=[...document.querySelectorAll('main tr')].slice(1);
    return rows.length; });
  return {
    request1: { url:p1.url, returned:p1.n, uniqueIds:s1.size, first:p1.first, last:p1.last },
    request2: { url:p2.url, returned:p2.n, uniqueIds:s2.size, first:p2.first, last:p2.last },
    idsSharedBetweenResponses: shared.length,
    tableRowsShownAfterNext: shown,
    duplicatesVisibleToUser: shared.length > 0 && shown === p2.n
  };
};
