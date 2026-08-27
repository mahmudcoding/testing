const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.waitForTimeout(6000);
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const ws=(window.__ws||[]);
    const all=ws.flatMap(w=>w.frames);
    const presenceish=all.filter(f=>/presence|hide_presence|online|status|user_update|profile/i.test(f.d)).map(f=>f.d.slice(0,220));
    const aliceDot=(()=>{for(const a of document.querySelectorAll('a[href*="/d/"]')){ if(!vis(a))continue;
      if(!/Alice/.test(a.innerText||''))continue;
      const d=[...a.querySelectorAll('span,div')].filter(d=>{const b=d.getBoundingClientRect();const cs=getComputedStyle(d);
        return vis(d)&&b.width>3&&b.width<=14&&Math.abs(b.width-b.height)<3&&cs.backgroundColor!=='rgba(0, 0, 0, 0)';});
      return d[0]?getComputedStyle(d[0]).backgroundColor:null;} return null;})();
    return { totalFrames: all.length, presenceFrames: presenceish.length, samples: presenceish.slice(0,6),
             lastFrames: all.slice(-5).map(f=>f.d.slice(0,140)), aliceDotNow: aliceDot };},VS);
};
