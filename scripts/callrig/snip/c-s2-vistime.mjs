export default async ({page}) => page.evaluate(()=>{
  const vis=(el)=>{const r=el.getBoundingClientRect();
    if(r.width<8||r.height<6) return false;
    let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
      if(cs.display==='none'||cs.visibility==='hidden') return false;
      op*=parseFloat(cs.opacity||'1'); n=n.parentElement;}
    if(op<0.05) return false;
    const hit=document.elementFromPoint(Math.round(r.x+r.width/2),Math.round(r.y+r.height/2));
    return !!(hit&&(el.contains(hit)||hit.contains(el)));};
  const msgs=[...document.querySelectorAll('main [data-message-id]')].slice(-6);
  return msgs.map(el=>{
    const all=[...el.querySelectorAll('*')].filter(e=>/\d{1,2}:\d{2}/.test((e.textContent||'').trim()))
      .filter(e=>(e.textContent||'').trim().length<34);
    return {head:(el.innerText||'').replace(/\s+/g,' ').slice(0,38),
      times: all.map(e=>{const r=e.getBoundingClientRect();
        return {t:(e.textContent||'').trim(), tag:e.tagName, leaf:e.children.length===0,
          w:Math.round(r.width), h:Math.round(r.height), cls:String(e.className||'').slice(0,26),
          visible:vis(e)};})};
  });
});
