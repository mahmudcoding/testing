export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  out.api = await page.evaluate(async()=>{
    const h = await (await fetch('/api/v1/meetings/history?limit=100',{credentials:'include'})).json().catch(()=>null);
    const arr = (h&&(h.meetings||h.items))||[];
    return arr.map(m=>({id:m.id, name:m.name, type:m.type||m.meeting_type, status:m.status, started:m.started_at, ended:m.ended_at, dur:m.duration, n:m.participant_count??m.participants_count}));
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.hub = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {
      live: (t.match(/Live now.{0,200}/)||[])[0]||null,
      recent: (t.match(/Recent calls.{0,500}/)||[])[0]||null
    };
  });
  out.tabs = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/^(All|Group meetings|1-to-1)\s*·/.test(t)));
  return out;
};
