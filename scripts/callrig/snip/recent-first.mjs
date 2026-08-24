export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const ui = await page.evaluate(()=>{const t=document.querySelector('main').innerText; const i=t.indexOf('Recent calls'); return t.slice(i,i+260).replace(/\n+/g,' | ');});
  const api = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/meetings/history?limit=3',{credentials:'include'})).json();
    return (j.meetings||[]).map(m=>({name:m.name||'(empty)', st:m.status, reason:m.end_reason||'-', ch:m.channel_id||'-', started:m.started_at, ended:m.ended_at}));});
  return {ui, api};
};
