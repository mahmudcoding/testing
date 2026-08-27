export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(()=>{
    const el=[...document.querySelectorAll('p')].find(e=>/\\/.test(e.innerText||''));
    if(!el) return {missing:true};
    const r=el.getBoundingClientRect(); let a=el, op=1, clip=false;
    while(a){ op=Math.min(op,parseFloat(getComputedStyle(a).opacity));
      if(a!==el&&a.contains(el)&&a.getBoundingClientRect().height===0) clip=true; a=a.parentElement; }
    const hit=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
    return {text:(el.innerText||'').slice(0,50), y:Math.round(r.y), h:Math.round(r.height),
            effectiveOpacity:op, hasZeroHeightAncestor:clip, hitIsSelf:hit===el||el.contains(hit)};
  });
};
