export default async ({page}) => {
  return await page.evaluate(()=>{
    const r=window.__tt; if(!r) return {err:'none'};
    clearInterval(r.id);
    const hits=r.events.filter(e=>e.rows.length);
    return {events:r.events.length, hits:hits.length,
      sample: hits.slice(0,5).map(h=>({ms:h.ms, rows:h.rows, vis:h.vis})),
      visSeen:[...new Set(r.events.map(e=>e.vis))],
      url:location.href};
  });
};
