export default async ({page}) => page.evaluate(()=>{
  const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
    let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
      if(cs.display==='none'||cs.visibility==='hidden') return false;
      op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
  const res=[];
  for (const e of document.querySelectorAll('body *')){
    if(e.children.length) continue;
    const t=(e.textContent||'').trim();
    if(!/^New$|replies$|reply$/.test(t)) continue;
    if(!vis(e)) continue;
    const r=e.getBoundingClientRect();
    // nearest ancestor that contains both a reply count and, maybe, New
    let anc=e, hops=0;
    while(anc.parentElement && hops<5 && !/repl/i.test(anc.innerText||'')) { anc=anc.parentElement; hops++; }
    const msg=e.closest('[data-message-id]');
    res.push({t, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width),
      inMessage: msg? msg.getAttribute('data-message-id'):null,
      ancText:(anc.innerText||'').replace(/\s+/g,' ').slice(0,40)});
  }
  return res;
});
