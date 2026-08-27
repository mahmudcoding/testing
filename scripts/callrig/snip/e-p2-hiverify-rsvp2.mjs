import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async ({WS}) => {
    const from = new Date(Date.now()-14*864e5).toISOString();
    const to   = new Date(Date.now()+14*864e5).toISOString();
    const lj = await (await fetch(`/api/v1/calendar/meetings?workspace_id=${WS}&from=${from}&to=${to}`,{credentials:'include'})).json();
    const list = lj.meetings || lj.data || [];
    const byStatus = {};
    for (const m of list) { (byStatus[m.my_status||'(none)'] ||= []).push((m.title||'').slice(0,28)); }
    const pending = list.filter(m=>m.my_status==='pending');
    let probe=null;
    if (pending.length) {
      const m=pending[0];
      const rr = await fetch(`/api/v1/calendar/meetings/${m.id}/respond`,{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body: JSON.stringify({status:'accepted'})});
      const rt = await rr.text();
      const l2 = await (await fetch(`/api/v1/calendar/meetings?workspace_id=${WS}&from=${from}&to=${to}`,{credentials:'include'})).json();
      const after=(( l2.meetings||l2.data||[]).find(x=>x.id===m.id)||{}).my_status;
      probe={title:(m.title||'').slice(0,30), before:'pending', status:rr.status, body:rt.slice(0,180), after};
    }
    return { total:list.length, byStatus: Object.fromEntries(Object.entries(byStatus).map(([k,v])=>[k,{n:v.length, sample:v.slice(0,4)}])), pendingProbe: probe };
  }, {WS});
};
