const readUI = () => {
  const m = document.querySelector('main') || document.body;
  const tabs = [...m.querySelectorAll('[role="tab"]')].map(t=>({l:t.textContent.trim(), sel:t.getAttribute('aria-selected')}));
  // recent rows: links to /calls/<id>
  const rows = [...m.querySelectorAll('a[href*="/calls/"], [data-testid*="recent"]')];
  const txts = [...m.querySelectorAll('li,[role="listitem"]')].map(e=>e.innerText.replace(/\n+/g,' · ').trim()).filter(t=>/Ended|Missed|Declined|Cancel/i.test(t));
  return {tabs, rowCount: rows.length, listItems: txts.length, sample: txts.slice(0,3), loadMore: !![...m.querySelectorAll('button')].find(b=>/load more/i.test(b.textContent))};
};

export default async ({page}) => {
  const out = {};
  out.before = await page.evaluate(readUI);
  // API truth
  out.api = await page.evaluate(async () => {
    const all = []; let cursor = ''; let pages = 0;
    for (;;) {
      const u = '/api/v1/meetings/history?limit=100' + (cursor ? '&before=' + encodeURIComponent(cursor) : '');
      const r = await fetch(u, {credentials:'include'});
      if (!r.ok) return {status: r.status, body: (await r.text()).slice(0,200)};
      const j = await r.json();
      pages++;
      all.push(...(j.meetings||[]));
      cursor = j.next_cursor || '';
      if (!cursor || pages > 6) break;
    }
    const kinds = {};
    for (const m of all) { const k = (m.type||m.meeting_type||m.kind||(m.is_dm?'dm':'?')); kinds[k]=(kinds[k]||0)+1; }
    return {total: all.length, pages, kinds, keys: Object.keys(all[0]||{}), first: all[0] ? {name:all[0].name, type:all[0].type, end_reason:all[0].end_reason, created_by:all[0].created_by, channel_id:all[0].channel_id} : null};
  });
  return out;
};
