export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const snap=()=>page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return {online:navigator.onLine,
      n:document.querySelectorAll('main [data-message-id]').length,
      m1:/QA-S2-GAP-1/.test(document.body.innerText),
      m3:/QA-S2-GAP-3/.test(document.body.innerText),
      indicator:[...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
        .map(e=>(e.textContent||'').trim())
        .filter(t=>/reconnect|connecting|no internet|connection lost|You are offline/i.test(t)&&t.length<60)};
  });
  out.before=await snap();
  await ctx.setOffline(true);
  const off=[];
  for(let i=0;i<20;i++){ await page.waitForTimeout(1500); off.push(await snap()); }
  out.offlineWindow={first:off[0], last:off.at(-1),
    indicators:[...new Set(off.flatMap(x=>x.indicator))],
    sawAny:off.some(x=>x.m1||x.m3), counts:[...new Set(off.map(x=>x.n))]};
  await ctx.setOffline(false);
  const on=[];
  for(let i=0;i<24;i++){ await page.waitForTimeout(1500); on.push(await snap()); }
  out.onlineWindow={first:on[0], last:on.at(-1),
    everM1:on.some(x=>x.m1), everM3:on.some(x=>x.m3),
    idxM3:on.findIndex(x=>x.m3), counts:[...new Set(on.map(x=>x.n))],
    indicators:[...new Set(on.flatMap(x=>x.indicator))]};
  return out;
};
