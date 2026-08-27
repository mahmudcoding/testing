export default async ({ browser }) => {
  const URL='file:///private/tmp/claude-501/-Users-mahmud-Projects-testing/1beb7afd-5a20-4aa5-8da9-4c3da4a06af7/scratchpad/render/index.html';
  const out={};
  for (const scheme of ['light','dark']) {
    const ctx=await browser.newContext({viewport:{width:1280,height:900}, colorScheme:scheme});
    const page=await ctx.newPage();
    try {
      await page.goto(URL,{waitUntil:'domcontentloaded'});
      await page.waitForTimeout(1200);
      out[scheme]=await page.evaluate(()=>{
        const L=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
          return 0.2126*r+0.7152*g+0.0722*b;};
        const parse=s=>{const m=s.match(/rgba?\(([^)]+)\)/); if(!m) return null;
          const p=m[1].split(',').map(x=>parseFloat(x)); return {rgb:p.slice(0,3), a:p.length>3?p[3]:1};};
        const bgOf=e=>{let n=e;while(n){const c=parse(getComputedStyle(n).backgroundColor);
          if(c&&c.a>0.9) return c.rgb; n=n.parentElement;} return [255,255,255];};
        const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
        let fails=[];
        for (const e of document.querySelectorAll('p,li,td,th,h1,h2,h3,code,span')) {
          if(!vis(e)) continue;
          if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())) continue;
          const st=getComputedStyle(e); const fg=parse(st.color); if(!fg) continue;
          const bg=bgOf(e);
          const comp=fg.rgb.map((v,i)=>v*fg.a+bg[i]*(1-fg.a));
          const l1=L(comp),l2=L(bg);
          const ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
          const size=parseFloat(st.fontSize), bold=parseInt(st.fontWeight)>=700;
          const thr=(size>=24||(size>=18.66&&bold))?3:4.5;
          if(ratio<thr) fails.push({t:(e.innerText||'').trim().slice(0,26), r:+ratio.toFixed(2), thr});
        }
        return { failures: fails.length, worst: fails.sort((a,b)=>a.r-b.r).slice(0,3) };
      });
    } finally { await ctx.close(); }
  }
  return out;
};
