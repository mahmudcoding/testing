export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const count=()=>page.evaluate(()=>({
    n:document.querySelectorAll('main [data-message-id]').length,
    online:navigator.onLine,
    gaps:['GAPLONG-1','GAPLONG-2','GAPLONG-3','GAPLONG-4','GAPLONG-5']
      .map(m=>document.body.innerText.includes(m))}));
  out.before=await count();
  await ctx.setOffline(true);
  // stay offline for ~180 s
  const off=[]; for(let i=0;i<12;i++){ await page.waitForTimeout(15000); off.push(await count()); }
  out.offlineEnd=off.at(-1);
  out.offlineStable=[...new Set(off.map(x=>x.n))];
  await ctx.setOffline(false);
  const on=[]; for(let i=0;i<24;i++){ await page.waitForTimeout(2000); on.push(await count()); }
  out.first=on[0]; out.last=on.at(-1);
  out.gapsAtEnd=on.at(-1).gaps;
  out.countTrail=[...new Set(on.map(x=>x.n))];
  out.allFiveAt=on.findIndex(x=>x.gaps.every(Boolean));
  out.server=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'})).json();
    return (j.messages||j.data||j||[]).map(m=>(m.body||'').slice(0,24)).filter(b=>/GAPLONG/.test(b));}, ch);
  return out;
};
