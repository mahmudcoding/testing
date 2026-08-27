const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(4000);
  const out=[];
  for (let i=0;i<10;i++) {
    const s = await page.evaluate(async (dm)=>{
      const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=5`,{credentials:'include'});
      const j=await r.json(); const list=(j.messages||j.data||[]);
      const ev=list.filter(m=>m.call_outcome!==undefined).map(m=>({id:m.id.slice(-6), out:m.call_outcome, dur:m.call_duration_seconds, at:m.created_at}));
      return {n:list.length, ev: ev.slice(0,2), now:new Date().toISOString()};
    }, DM);
    out.push(s);
    if (s.ev.some(e=>e.at > '2026-08-26T10:47:29Z')) break;
    await page.waitForTimeout(25000);
  }
  const dom = await page.evaluate(()=>{
    return [...document.querySelectorAll('[data-message-id]')].slice(-3).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,70));
  });
  return {polls: out.length, last: out[out.length-1], first: out[0], dom};
};
