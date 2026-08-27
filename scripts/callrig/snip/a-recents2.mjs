const rowsJs = () => {
  const m = document.querySelector('main') || document.body;
  const items = [...m.querySelectorAll('li,[role="listitem"]')].filter(e=>/Ended|Missed|Declined|Cancel/i.test(e.innerText));
  return items.map(e => {
    const attrs = {};
    for (const a of e.attributes) if (a.name.startsWith('data-')) attrs[a.name]=a.value;
    const inner = e.querySelector('[data-meeting-id],[data-testid],a[href]');
    return {
      text: e.innerText.replace(/\n+/g,' · ').trim().slice(0,120),
      attrs,
      href: e.querySelector('a')?.getAttribute('href') || null,
      innerTid: inner?.getAttribute('data-testid') || null
    };
  });
};
const tabsJs = () => [...(document.querySelector('main')||document.body).querySelectorAll('[role="tab"]')].map(t=>({l:t.textContent.trim(), sel:t.getAttribute('aria-selected')}));

export default async ({page}) => {
  const out = {};
  out.tabsBefore = await page.evaluate(tabsJs);
  const rows = await page.evaluate(rowsJs);
  out.rowsBefore = rows.length;
  out.sampleRows = rows.slice(0,4);
  out.api20 = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=20', {credentials:'include'});
    const j = await r.json();
    return (j.meetings||[]).map(m=>({id:m.id, name:m.name, by:m.created_by, ch:m.channel_id, st:m.started_at, en:m.ended_at, rating:m.rating, status:m.status}));
  });
  out.me = await page.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).user?.id);
  // click load more
  const lm = await page.$('button:has-text("Load more")');
  if (lm) { await lm.click(); await page.waitForTimeout(2500); }
  out.tabsAfter = await page.evaluate(tabsJs);
  out.rowsAfter = (await page.evaluate(rowsJs)).length;
  return out;
};
