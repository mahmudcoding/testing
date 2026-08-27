export default async ({page}) => {
  const h=await page.evaluateHandle(()=>{
    let found=null;
    const walk=(n)=>{ for(const c of n.childNodes){
        if(found) return;
        if(c.nodeType===3 && /^R4Q[A-Z0-9]{10,}$/.test((c.textContent||'').trim())) {found=c.parentElement;return;}
        if(c.nodeType===1) walk(c); } };
    walk(document.body); return found;
  });
  const el=h.asElement();
  if(!el) return {found:false};
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  return page.evaluate((e)=>{
    const r=e.getBoundingClientRect();
    let op=1,n=e; while(n&&n!==document.documentElement){const s=getComputedStyle(n);
      op*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden'){op=0;break;} n=n.parentElement;}
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return {text:(e.textContent||'').trim().slice(0,30),
      rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
      viewportH:innerHeight, opacityProduct:+op.toFixed(2),
      hitIsSelfOrChild:!!hit&&(e.contains(hit)||hit.contains(e)),
      hitText:hit?(hit.textContent||'').trim().slice(0,30):null,
      fontSize:getComputedStyle(e).fontSize, color:getComputedStyle(e).color,
      block:(e.parentElement&&(e.parentElement.innerText||'').replace(/\s+/g,' ').trim().slice(0,60))||''};
  }, el);
};
