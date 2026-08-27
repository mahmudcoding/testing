export default async ({page}) => page.evaluate((tag)=>{
  const els=[...document.querySelectorAll('main [data-message-id]')];
  const row=els.find(e=>(e.innerText||'').includes(tag));
  if(!row) return {row:false};
  const b=[...row.querySelectorAll('button,a')]
    .find(x=>/Open source message|View original/i.test(x.getAttribute('aria-label')||x.innerText||''));
  if(!b) return {row:true, btn:false};
  let op=1,n=b,hidden=null;
  while(n&&n!==document.documentElement){const s=getComputedStyle(n);
    op*=parseFloat(s.opacity||'1');
    if(s.display==='none'||s.visibility==='hidden'){hidden=n.tagName.toLowerCase();op=0;break;}
    n=n.parentElement;}
  const r=b.getBoundingClientRect();
  const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {row:true, btn:true,
    label:(b.getAttribute('aria-label')||b.innerText||'').slice(0,30),
    tag:b.tagName, href:b.getAttribute('href')||null,
    rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
    viewportH:innerHeight, opacityProduct:+op.toFixed(2), hiddenBy:hidden,
    hitIsSelfOrChild:!!hit&&(b.contains(hit)||hit.contains(b)),
    hitText:hit?(hit.textContent||'').trim().slice(0,24):null,
    pointerEvents:getComputedStyle(b).pointerEvents};
}, 'QA-SAVEDDEL-t4k');
