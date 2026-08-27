export default async ({page}) => {
  return page.evaluate(()=>{
    const visible=(el)=>{
      const r=el.getBoundingClientRect();
      if(r.width<2||r.height<2) return false;
      let op=1,n=el;
      while(n&&n!==document.documentElement){ const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement; }
      if(op<0.05) return false;
      const hit=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
      return !!(hit && (el.contains(hit)||hit.contains(el)));
    };
    const out={url:location.pathname, items:[]};
    for (const el of document.querySelectorAll('main *')){
      if (el.children.length) continue;
      const t=(el.textContent||'').trim();
      if(!t||t.length>70) continue;
      if(!visible(el)) continue;
      const r=el.getBoundingClientRect();
      out.items.push({t, y:Math.round(r.y), x:Math.round(r.x), tag:el.tagName});
    }
    out.buttons=[...document.querySelectorAll('main button')].filter(visible)
      .map(b=>({label:b.getAttribute('aria-label')||b.textContent.trim().slice(0,24),
        y:Math.round(b.getBoundingClientRect().y)}));
    out.msgCount=document.querySelectorAll('main [data-message-id]').length;
    return out;
  });
};
