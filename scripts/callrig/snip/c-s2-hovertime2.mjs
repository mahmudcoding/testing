export default async ({page}) => {
  const out={runs:[]};
  const idxs=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const r=[];
    for(let i=els.length-1;i>=0&&r.length<3;i--){
      const t=els[i].querySelector('time'); const rr=t&&t.getBoundingClientRect();
      if(!t||!rr||rr.width<4) r.push(i);
    }
    return r;
  });
  out.groupedIdx=idxs;
  for (const idx of idxs){
    const el=page.locator('main [data-message-id]').nth(idx);
    await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    const before=await el.evaluate(e=>({
      btns:[...e.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>4).length}));
    await el.hover(); await page.waitForTimeout(900);
    const after=await el.evaluate(e=>{
      const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<8||r.height<6) return false;
        let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
          if(cs.display==='none'||cs.visibility==='hidden') return false;
          op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
      // search the row AND its parent, in case the gutter sits outside
      const scope=e.parentElement||e;
      const times=[...scope.querySelectorAll('*')].filter(x=>x.children.length===0)
        .filter(x=>/^\d{1,2}:\d{2}/.test((x.textContent||'').trim()))
        .filter(vis).map(x=>(x.textContent||'').trim());
      return {btns:[...e.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>4)
          .map(b=>b.getAttribute('aria-label')).slice(0,4),
        visibleTimesInRowOrParent:[...new Set(times)]};
    });
    out.runs.push({idx, btnsBefore:before.btns, btnsAfterHover:after.btns.length,
      hoverEngaged: after.btns.length>before.btns, sampleBtns:after.btns,
      times:after.visibleTimesInRowOrParent});
  }
  return out;
};
