export default async ({page}) => {
  const WS='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  return await page.evaluate(async (ws)=>{
    const dir = await (await fetch(`/api/v1/workspaces/${ws}/members?limit=50`,{credentials:'include'})).json().catch(()=>null);
    const start = new Date(Date.now() + 150000);
    start.setSeconds(0,0);
    const ends = new Date(start.getTime() + 15*60000);
    const body = {workspace_id: ws, title:'QA-C-SCHED-1', starts_at: start.toISOString(), ends_at: ends.toISOString(), timezone:'Asia/Tashkent', attendee_user_ids:['U4QCCAROL000001']};
    const r = await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const t = (await r.text()).slice(0,400);
    return {status:r.status, body:t, startsAt: start.toISOString(), now: new Date().toISOString(), dirKeys: dir? Object.keys(dir).slice(0,5):null};
  }, WS);
};
