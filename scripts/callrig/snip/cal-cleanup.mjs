export default async ({page}) => {
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01&from=2026-08-24T00:00:00.000Z&to=2026-09-30T00:00:00.000Z',{credentials:'include'});
    const j = await r.json();
    const list = (j.meetings||j.events||[]);
    const out = [];
    for (const m of list) {
      if (/QA Probe|QA Recur Probe/.test(m.title||'')) {
        const d = await fetch('/api/v1/calendar/meetings/'+m.id,{method:'DELETE',credentials:'include'});
        out.push(m.title+' ('+m.id+') -> '+d.status);
      } else out.push('KEEP: '+m.title+' ('+m.id+')');
    }
    return {n:list.length, out};
  });
};
