const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const out={};
    for(const a of document.querySelectorAll('a[href*="/d/"]')){ if(!vis(a))continue;
      const nm=(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,14);
      const d=[...a.querySelectorAll('span,div')].filter(d=>{const b=d.getBoundingClientRect();const cs=getComputedStyle(d);
        return vis(d)&&b.width>3&&b.width<=14&&Math.abs(b.width-b.height)<3&&cs.backgroundColor!=='rgba(0, 0, 0, 0)';})
        .map(d=>getComputedStyle(d).backgroundColor);
      out[nm]=d[0]||null; }
    return out;},VS);
  const live=[];
  for(let i=0;i<14;i++){ live.push({t:i*1000, ...(await read())}); await page.waitForTimeout(1000); }
  // fresh reload — distinguishes live propagation from server truth
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000);
  const afterReload = await read();
  return { liveFirst: live[0], liveLast: live[live.length-1],
           changed: JSON.stringify(live[0])!==JSON.stringify(live[live.length-1]), afterReload };
};
