export default async ({page}) => page.evaluate(()=>{
  const b=document.querySelector('button[aria-label="Jump to pinned message"]');
  if(!b) return {found:false};
  const r=b.getBoundingClientRect();
  let op=1,n=b,chain=[];
  while(n&&n!==document.documentElement){
    const s=getComputedStyle(n);
    op*=parseFloat(s.opacity||'1');
    if(s.display==='none'||s.visibility==='hidden') op=0;
    chain.push(`${n.tagName.toLowerCase()} op=${s.opacity} disp=${s.display} h=${Math.round(n.getBoundingClientRect().height)} ov=${s.overflow}`);
    n=n.parentElement;
  }
  const probe=(x,y)=>{const e=document.elementFromPoint(x,y);
    return e?`${e.tagName}:${(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)}`:'null';};
  return {rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
    viewport:{w:innerWidth,h:innerHeight}, opacityProduct:+op.toFixed(3),
    atCenter:probe(r.left+r.width/2,r.top+r.height/2),
    atLeft:probe(r.left+12,r.top+r.height/2),
    atTop:probe(r.left+r.width/2,r.top+4),
    ancestors:chain.slice(0,5)};
});
