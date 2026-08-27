export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.hub = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return { live:(t.match(/Live now.{0,220}/)||[])[0]||null, sched:(t.match(/Scheduled today.{0,200}/)||[])[0]||null };
  });
  out.notifs = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=6',{credentials:'include'})).json().catch(()=>null);
    const a=(j&&(j.notifications||j.items||j.data))||[];
    return a.slice(0,5).map(n=>({type:n.type, title:(n.title||'').slice(0,60), body:(n.body||n.message||'').slice(0,70)}));
  });
  return out;
};
