export default async ({page}) => {
  const find=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/pin/i.test(x.getAttribute('aria-label')||''));
    if(!b) return null;
    let n=b; for(let i=0;i<3&&n.parentElement;i++) n=n.parentElement;
    const va=[...n.querySelectorAll('button')].filter(v)
      .find(e=>/View all/i.test(e.innerText||''));
    const R=(e)=>{const r=e.getBoundingClientRect();
      return {cx:Math.round(r.left+r.width/2),cy:Math.round(r.top+r.height/2)};};
    const sc=document.querySelector('main [data-message-id]')?.closest('[class*=scroll],div');
    return {jump:R(b), viewAll:va?R(va):null,
            scrollTop:Math.round(sc?sc.scrollTop:-1), url:location.pathname+location.search};
  });
  const before=await find();
  await page.mouse.click(before.viewAll.cx, before.viewAll.cy);
  await page.waitForTimeout(3500);
  const afterViewAll=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="menu"],aside')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,110));
    return {panels:d.slice(0,3), url:location.pathname+location.search};
  });
  const mid=await find();
  let afterJump=null;
  if(mid){ await page.mouse.click(mid.jump.cx, mid.jump.cy); await page.waitForTimeout(3000);
    afterJump=await find(); }
  return {before:{scrollTop:before.scrollTop,url:before.url},
          afterViewAll, afterJump:afterJump&&{scrollTop:afterJump.scrollTop,url:afterJump.url}};
};
