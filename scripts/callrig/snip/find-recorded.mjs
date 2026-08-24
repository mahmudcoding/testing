export default async ({page}) => {
  return await page.evaluate(async () => {
    const h = await (await fetch('/api/v1/meetings/history?limit=100',{credentials:'include'})).json();
    const out = [];
    for (const m of (h.meetings||[]).slice(0,30)) {
      const r = await fetch('/api/v1/meeting/'+m.id+'/recordings',{credentials:'include'});
      if (r.status===200) { const j = await r.json(); if ((j.recordings||[]).length) out.push({id:m.id, name:m.name, recs:j.recordings.map(x=>({rid:x.id,dur:x.duration_sec,size:x.file_size,scope:x.access_scope,st:x.status}))}); }
    }
    return out;
  });
};
