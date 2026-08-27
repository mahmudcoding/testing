export default async ({page}) => {
  return await page.evaluate(async () => {
    const from = new Date(Date.now()-6*3600e3).toISOString();
    const to = new Date(Date.now()+18*3600e3).toISOString();
    const j = await (await fetch(`/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01&from=${from}&to=${to}`,{credentials:'include'})).json();
    const list = (j.meetings||j.events||j.items||[]);
    const mine = list.filter(m=>/^QA-A-SCHED/.test(m.title||''));
    const out = [];
    for (const m of mine) {
      const r = await fetch('/api/v1/calendar/meetings/'+m.id, {method:'DELETE', credentials:'include'});
      out.push(`${m.title} ${m.id} -> ${r.status}`);
    }
    const after = await (await fetch(`/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01&from=${from}&to=${to}`,{credentials:'include'})).json();
    return {found: mine.length, deleted: out, remaining: (after.meetings||after.events||after.items||[]).map(m=>m.title)};
  });
};
