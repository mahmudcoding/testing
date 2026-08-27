const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);const o={};
    for(const a of document.querySelectorAll('a[href*="/d/"]')){ if(!vis(a))continue;
      const nm=(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,10);
      const d=[...a.querySelectorAll('span,div')].filter(d=>{const b=d.getBoundingClientRect();const cs=getComputedStyle(d);
        return vis(d)&&b.width>3&&b.width<=14&&Math.abs(b.width-b.height)<3&&cs.backgroundColor!=='rgba(0, 0, 0, 0)';}).map(d=>getComputedStyle(d).backgroundColor);
      o[nm]=d[0]||null;} return o;},VS);
  const G='rgb(19, 122, 58)';
  const samples=[]; let flipAt=null;
  for(let i=0;i<40;i++){ const r=await read(); samples.push(r);
    const al=Object.entries(r).find(([k])=>/Alice/.test(k))?.[1];
    if(flipAt===null && al===G) flipAt=i*1500;
    await page.waitForTimeout(1500); }
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000);
  return { vis: await page.evaluate(()=>document.visibilityState),
           first: samples[0], last: samples[samples.length-1], wentGreenAtMs: flipAt,
           totalWatchedMs: 40*1500, afterReload: await read() };
};
