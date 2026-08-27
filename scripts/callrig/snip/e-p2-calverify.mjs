import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // 1. what the still-open page shows RIGHT NOW (no navigation)
  const stale = await page.evaluate(function () {
    return {chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length,
            has: (document.body.innerText||'').includes('QA-E late3'),
            connecting: /Connecting…|Reconnecting/.test(document.body.innerText||'')};
  });
  // 2. what the SERVER says, asked from that same page
  const api = await page.evaluate(async function (ws) {
    const from=new Date(Date.now()-2*864e5).toISOString(), to=new Date(Date.now()+3*864e5).toISOString();
    const r=await fetch(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${from}&to=${to}`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const list=j.meetings||j.data||[];
    return {status:r.status, total:list.length,
            late3: list.filter(m=>(m.title||'').includes('QA-E late3')).map(m=>({id:m.id,title:m.title,my_status:m.my_status}))};
  }, WS);
  // 3. reload and look again
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const afterReload = await page.evaluate(function () {
    return {chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length,
            has: (document.body.innerText||'').includes('QA-E late3')};
  });
  return {stalePage: stale, server: api, afterReload};
};
