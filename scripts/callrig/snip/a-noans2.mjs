export default async ({page}) => {
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=100',{credentials:'include'});
    const j = await r.json();
    const out = [];
    for (const m of (j.meetings||[])) {
      const st = m.started_at, en = m.ended_at;
      if (!st || !en) continue;
      const dur = (new Date(en) - new Date(st))/1000;
      out.push({id:m.id, st, en, durSec: dur, by:m.created_by, ch:m.channel_id, name:m.name});
    }
    // the two no-answer calls were Aug 24 09:27Z and 09:30Z
    return out.filter(x=>x.st.startsWith('2026-08-24T09:2')||x.st.startsWith('2026-08-24T09:3')||x.st.startsWith('2026-08-23'));
  });
};
