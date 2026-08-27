import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(async ({WS}) => {
    const from = new Date(Date.now()-14*864e5).toISOString();
    const to   = new Date(Date.now()+14*864e5).toISOString();
    const lr = await fetch(`/api/v1/calendar/meetings?workspace_id=${WS}&from=${from}&to=${to}`,{credentials:'include'});
    const lj = await lr.json().catch(()=>({}));
    const list = lj.meetings || lj.data || (Array.isArray(lj)?lj:[]);
    const brief = list.slice(0,12).map(m=>({id:m.id, title:(m.title||m.name||'').slice(0,34), my_status:m.my_status}));
    const out={listStatus:lr.status, count:list.length, sample:brief, probes:[]};
    // try responding on up to 3 meetings, whatever their my_status
    for (const m of list.slice(0,3)) {
      const before = m.my_status;
      const rr = await fetch(`/api/v1/calendar/meetings/${m.id}/respond`,{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body: JSON.stringify({status:'accepted'})});
      const rt = await rr.text();
      // re-read the list to see whether anything changed
      const l2 = await (await fetch(`/api/v1/calendar/meetings?workspace_id=${WS}&from=${from}&to=${to}`,{credentials:'include'})).json().catch(()=>({}));
      const l2list = l2.meetings || l2.data || [];
      const after = (l2list.find(x=>x.id===m.id)||{}).my_status;
      // and the by-id card, to check my_status is absent there
      const cr = await fetch(`/api/v1/calendar/meetings/${m.id}`,{credentials:'include'});
      const cj = await cr.json().catch(()=>({}));
      const card = cj.meeting || cj;
      out.probes.push({ id:m.id, title:(m.title||m.name||'').slice(0,30),
        my_status_before: before, respond_status: rr.status, respond_body: rt.slice(0,190),
        my_status_after: after,
        card_has_my_status: Object.prototype.hasOwnProperty.call(card,'my_status'),
        card_keys: Object.keys(card).slice(0,14) });
    }
    return out;
  }, {WS});
};
