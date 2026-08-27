const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const mark = await page.evaluate(()=> (window.__ws||[]).flatMap(w=>w.frames).length);
  await page.waitForTimeout(75000);   // watch 75s with NO action anywhere
  return await page.evaluate(([vs,mark])=>{const vis=eval(vs);
    const all=(window.__ws||[]).flatMap(w=>w.frames);
    const nu=all.slice(mark);
    const pres=nu.filter(f=>/presence/i.test(f.d)).map(f=>f.d.slice(0,170));
    const dot=(()=>{for(const a of document.querySelectorAll('a[href*="/d/"]')){ if(!vis(a)||!/Alice/.test(a.innerText||''))continue;
      const d=[...a.querySelectorAll('span,div')].filter(d=>{const b=d.getBoundingClientRect();const cs=getComputedStyle(d);
        return vis(d)&&b.width>3&&b.width<=14&&Math.abs(b.width-b.height)<3&&cs.backgroundColor!=='rgba(0, 0, 0, 0)';});
      return d[0]?getComputedStyle(d[0]).backgroundColor:null;} return null;})();
    return { newFrames:nu.length, presenceFrames:pres.length, presenceSamples:pres.slice(0,8), aliceDotNow:dot };},[VS,mark]);
};
