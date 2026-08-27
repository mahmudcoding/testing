export default async ({page}) => {
  await page.waitForTimeout(11000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
      .find(x=>/pin/i.test(x.getAttribute('aria-label')||x.innerText||''));
    let vis=null;
    if(b){
      let op=1,n=b;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden') op=0; n=n.parentElement;}
      const r=b.getBoundingClientRect();
      const hit=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
      vis={opacityProduct:+op.toFixed(3), rect:{x:Math.round(r.left),y:Math.round(r.top),
           w:Math.round(r.width),h:Math.round(r.height)},
           hitIsSelfOrChild: !!hit && (b.contains(hit)||hit.contains(b))};
    }
    return {log:(window.__pinlog||[]).map(e=>`${e.t}s: ${e.v}`), visible:vis};
  });
};
