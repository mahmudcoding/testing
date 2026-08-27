export default async ({page}) => {
  return await page.evaluate(async () => {
    const out={};
    const r = await fetch('/api/v1/meetings/history?limit=100', {credentials:'include'});
    const j = await r.json();
    const arr = j.meetings||[];
    out.total = arr.length;
    out.next = j.next_cursor ?? null;
    out.types = arr.slice(0,25).map(m=>({name:(m.name||'').slice(0,26), status:m.status, type:m.type||m.meeting_type||null, dir:m.direction||null}));
    const r20 = await fetch('/api/v1/meetings/history?limit=20', {credentials:'include'});
    const j20 = await r20.json();
    out.page1 = (j20.meetings||[]).length;
    out.page1next = j20.next_cursor ?? null;
    return out;
  });
};
