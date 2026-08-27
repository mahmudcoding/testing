export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  const s=[];
  for(let i=0;i<26;i++){ await page.waitForTimeout(450);
    s.push(await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect();
        if(r.width<2||r.height<2) return false;
        let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
          if(cs.display==='none'||cs.visibility==='hidden') return false;
          op*=parseFloat(cs.opacity||'1'); n=n.parentElement;}
        return op>=0.05;};
      const hits=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0)
        .filter(e=>/Start this channel|Add teammates|Add users/.test(e.textContent||''))
        .filter(vis).map(e=>(e.textContent||'').trim().slice(0,40));
      return {n:hits.length, hits, rows:document.querySelectorAll('main [data-message-id]').length,
        emptyState:[...document.querySelectorAll('main *')].filter(e=>e.children.length===0)
          .filter(vis).map(e=>(e.textContent||'').trim())
          .filter(t=>/saved|empty|nothing|yet/i.test(t)&&t.length<60).slice(0,3)};
    }));
  }
  return {samples:s.length, everVisible:s.some(x=>x.n>0),
    maxHits:Math.max(...s.map(x=>x.n)), rowsSeen:[...new Set(s.map(x=>x.rows))],
    emptyStateSeen:[...new Set(s.flatMap(x=>x.emptyState))].slice(0,6),
    first:s[0], last:s.at(-1)};
};
