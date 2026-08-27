export default async ({page}) => page.evaluate(()=>{
  const b=document.querySelector('button[aria-label="Add users"]');
  if(!b) return {found:false};
  const r=b.getBoundingClientRect();
  let op=1,n=b,hid=null;
  while(n&&n!==document.documentElement){const s=getComputedStyle(n);
    op*=parseFloat(s.opacity||'1');
    if(s.display==='none'||s.visibility==='hidden'){hid=n.tagName.toLowerCase();op=0;break;} n=n.parentElement;}
  const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
    viewport:{w:innerWidth,h:innerHeight}, opacityProduct:+op.toFixed(2), hiddenBy:hid,
    hitIsSelfOrChild:!!hit&&(b.contains(hit)||hit.contains(b)),
    hitText:hit?(hit.textContent||'').replace(/\s+/g,' ').trim().slice(0,26):null,
    pointerEvents:getComputedStyle(b).pointerEvents};
});
