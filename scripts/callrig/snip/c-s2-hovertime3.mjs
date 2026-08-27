export default async ({page}) => {
  const out={};
  const idx=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    for(let i=els.length-1;i>=0;i--){
      const t=els[i].querySelector('time'); const rr=t&&t.getBoundingClientRect();
      if(!t||!rr||rr.width<4) return i;
    }
    return -1;
  });
  out.idx=idx;
  if(idx<0) return out;
  const el=page.locator('main [data-message-id]').nth(idx);
  await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  const probe=()=>el.evaluate(e=>{
    const opOf=(x)=>{let op=1,n=x; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;} return op;};
    const react=[...e.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Add reaction');
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<8||r.height<6) return false;
      return opOf(x)>=0.05;};
    const times=[...(e.parentElement||e).querySelectorAll('*')].filter(x=>x.children.length===0)
      .filter(x=>/^\d{1,2}:\d{2}/.test((x.textContent||'').trim())).filter(vis)
      .map(x=>(x.textContent||'').trim());
    return {reactOpacity: react? +opOf(react).toFixed(2):null,
      reactW: react? Math.round(react.getBoundingClientRect().width):null,
      visibleTimes:[...new Set(times)]};
  });
  out.before=await probe();
  await el.hover();
  const s=[]; for(let i=0;i<6;i++){ await page.waitForTimeout(350); s.push(await probe()); }
  out.afterHover=s.at(-1);
  out.maxOpacity=Math.max(...s.map(x=>x.reactOpacity||0));
  out.anyTimeDuringHover=s.some(x=>x.visibleTimes.length>0);
  // move the mouse away to confirm the toolbar hides again
  await page.mouse.move(5,5); await page.waitForTimeout(700);
  out.afterLeave=await probe();
  return out;
};
