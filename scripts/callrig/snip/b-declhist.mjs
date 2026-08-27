export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(async()=>{
    const h=await (await fetch('/api/v1/meetings/history?limit=5',{credentials:'include'})).json().catch(()=>null);
    const a=(h&&(h.meetings||h.items))||[];
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {
      apiTop: a.slice(0,2).map(m=>({name:m.name, started:m.started_at, ended:m.ended_at, status:m.status})),
      firstRow: (t.match(/TODAY.{0,140}/)||[])[0]||null,
      tabs: [...document.querySelectorAll('button')].map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(x=>/^(All|Group meetings|1-to-1)\s*·/.test(x))
    };
  });
};
