export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(9000);
  return page.evaluate(()=>{
    const visInfo=(el)=>{
      const r=el.getBoundingClientRect();
      if(r.width<2||r.height<2) return {ok:false, why:`rect ${Math.round(r.width)}x${Math.round(r.height)}`};
      let op=1,n=el;
      while(n&&n!==document.documentElement){ const cs=getComputedStyle(n);
        if(cs.display==='none') return {ok:false, why:'display:none on '+n.tagName};
        if(cs.visibility==='hidden') return {ok:false, why:'visibility:hidden'};
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement; }
      if(op<0.05) return {ok:false, why:'opacity '+op.toFixed(2)};
      const hit=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
      if(!(hit&&(el.contains(hit)||hit.contains(el)))) return {ok:false, why:'covered by '+(hit&&hit.tagName)};
      return {ok:true, rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};
    };
    const res=[];
    for (const el of document.querySelectorAll('main *')){
      if(el.children.length) continue;
      const t=(el.textContent||'').trim();
      if(!/Start this channel|Add teammates|Add users|Pinned message|no message text|View all/.test(t)) continue;
      res.push({t:t.slice(0,48), vis:visInfo(el)});
    }
    return {rows:document.querySelectorAll('main [data-message-id]').length,
      hits:res,
      anyVisible:res.some(x=>x.vis.ok),
      mainHead:(document.querySelector('main')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,150)};
  });
};
