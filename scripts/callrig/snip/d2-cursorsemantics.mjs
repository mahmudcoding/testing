// Is the API's own next_before lossy or overlapping? Compare it with the last row.
export default async ({page}) => {
  const CO='O4QDF1XTURESO01', WS='W4QDF1XTURESO01';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(async ({CO,WS})=>{
    const g=async u=>await (await fetch(u,{credentials:'include'})).json();
    const out={};
    // company endpoint: it returns its own cursor
    const p1=await g(`/api/v1/companies/${CO}/admin/audit-log?limit=5`);
    const e1=p1.entries||[];
    out.company={ rows:e1.length,
      lastRowAt:e1[e1.length-1]&&e1[e1.length-1].created_at,
      lastRowId:e1[e1.length-1]&&e1[e1.length-1].id,
      next_before:p1.next_before, next_before_id:p1.next_before_id,
      cursorEqualsLastRow: p1.next_before===(e1[e1.length-1]||{}).created_at };
    const p2=await g(`/api/v1/companies/${CO}/admin/audit-log?limit=5&before=${encodeURIComponent(p1.next_before)}&before_id=${encodeURIComponent(p1.next_before_id)}`);
    const e2=p2.entries||[];
    out.company.page2FirstAt=e2[0]&&e2[0].created_at;
    out.company.overlapIds=e1.filter(a=>e2.some(b=>b.id===a.id)).length;
    // what a full-precision read says sits between them
    out.company.page1Ids=e1.map(e=>e.id); out.company.page2Ids=e2.map(e=>e.id);
    // workspace endpoint: bare array, no cursor -> what does the client synthesise?
    const w1=await g(`/api/v1/workspaces/${WS}/admin/audit-log?limit=5`);
    const wa=Array.isArray(w1)?w1:(w1.entries||[]);
    out.workspace={rows:wa.length, lastRowAt:wa[wa.length-1]&&wa[wa.length-1].created_at, hasCursorField:!Array.isArray(w1)};
    return out;
  }, {CO,WS});
};
