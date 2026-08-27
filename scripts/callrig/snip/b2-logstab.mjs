export default async ({ page }) => {
  const ws='W4QBF1XTURESO01', id=process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${ws}/calls/${id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v).find(x=>/^Logs\b/.test((x.innerText||'').trim()));
    if (b) b.click(); });
  await page.waitForTimeout(3000);
  const rows = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const cand = [...document.querySelectorAll('li,tr,div')].filter(v)
      .filter(e=>/\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)/i.test(e.innerText||'') && (e.innerText||'').length < 200);
    const min = cand.filter(e=>!cand.some(o=>o!==e && e.contains(o)));
    return min.map(e=>e.innerText.replace(/\n+/g,' | ').trim().slice(0,110));
  });
  const api = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}/events?limit=200`, {credentials:'include'});
    const j = await r.json(); const arr = Array.isArray(j)?j:(j.events||j.data||j.items||[]);
    const c = {}; for (const e of arr) c[e.event_type] = (c[e.event_type]||0)+1;
    return c;
  }, id);
  return { uiRowCount: rows.length, uiRows: rows.slice(0, 24), apiEventCounts: api };
};
