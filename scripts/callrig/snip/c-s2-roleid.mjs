export default async ({page}) => page.evaluate(()=>{
  const hits=[];
  const walk=(n)=>{ for(const c of n.childNodes){
      if(c.nodeType===3 && /R4Q[A-Z0-9]{10,}/.test(c.textContent||'')) hits.push(c.parentElement);
      else if(c.nodeType===1) walk(c); } };
  walk(document.body);
  return hits.slice(0,3).map(e=>{
    const r=e.getBoundingClientRect();
    let op=1,n=e,hiddenBy=null;
    while(n&&n!==document.documentElement){const s=getComputedStyle(n);
      op*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden'){hiddenBy=n.tagName.toLowerCase();op=0;break;}
      n=n.parentElement;}
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return {text:(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40),
      rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
      opacityProduct:+op.toFixed(2), hiddenBy,
      hitIsSelfOrChild: !!hit && (e.contains(hit)||hit.contains(e)),
      parentText:(e.parentElement&&(e.parentElement.innerText||'').replace(/\s+/g,' ').trim().slice(0,80))||''};
  });
});
