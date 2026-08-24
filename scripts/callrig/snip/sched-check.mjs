export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const m = await page.evaluate(()=>{const t=document.querySelector('main').innerText; const i=t.search(/Scheduled today|Сегодня по расписанию/); return t.slice(i,i+260).replace(/\n+/g,' | ');});
  const api = await page.evaluate(async()=>{const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01&from='+new Date(Date.now()-3600e3).toISOString()+'&to='+new Date(Date.now()+86400e3).toISOString(),{credentials:'include'});
    const j=await r.json(); return (j.meetings||[]).map(x=>({t:x.title,s:x.starts_at,pc:x.participant_count}));});
  return {ui:m, api};
};
