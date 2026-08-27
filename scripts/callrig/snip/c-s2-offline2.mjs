export default async ({page, ctx}) => {
  const out={};
  const snap=()=>page.evaluate(()=>({
    online:navigator.onLine,
    n:document.querySelectorAll('main [data-message-id]').length,
    hasOffline:[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/offline|reconnect|connecting|no internet|connection/i.test(t)&&t.length<60),
    has1:/QA-S2-OFFLINE-1/.test(document.body.innerText),
    has3:/QA-S2-OFFLINE-3/.test(document.body.innerText)}));
  // still offline: poll for an indicator
  const off=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(1500); off.push(await snap()); }
  out.whileOffline={first:off[0], last:off.at(-1),
    indicatorsSeen:[...new Set(off.flatMap(x=>x.hasOffline))],
    sawMessages:off.some(x=>x.has1||x.has3)};
  // back online
  await ctx.setOffline(false);
  const on=[];
  for(let i=0;i<20;i++){ await page.waitForTimeout(1500); on.push(await snap()); }
  out.afterOnline={first:on[0], last:on.at(-1),
    everHas1:on.some(x=>x.has1), everHas3:on.some(x=>x.has3),
    firstIndexWith3:on.findIndex(x=>x.has3),
    indicatorsSeen:[...new Set(on.flatMap(x=>x.hasOffline))]};
  return out;
};
