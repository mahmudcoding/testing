export default async ({page}) => {
  await page.goto('https://staging.airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(async()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    const r=await fetch('/api/v1/workspace/W4QBF1XTURESO01/meetings/active',{credentials:'include'}); const j=await r.json();
    return { url:location.href, live:(t.match(/Live now.{0,170}/)||[])[0]||null, sched:(t.match(/Scheduled today.{0,200}/)||[])[0]||null,
             active:(j.meetings||[]).map(m=>({id:m.id,name:m.name,pc:m.participant_count})),
             startCall:[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0&&/^Start call$/i.test((x.innerText||'').trim())).length,
             join:[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0&&/^Join$/i.test((x.innerText||'').trim())).length,
             head: t.slice(0,400) };
  });
};
