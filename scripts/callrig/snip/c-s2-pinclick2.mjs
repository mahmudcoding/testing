export default async ({page}) => {
  await page.evaluate(()=>{
    window.__clicks=[];
    document.addEventListener('click',(e)=>{
      const t=e.target.closest('button')||e.target;
      window.__clicks.push({tag:t.tagName,aria:(t.getAttribute&&t.getAttribute('aria-label'))||'',
        text:(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,28)});
    },true);
  });
  const pos=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/pin/i.test(x.getAttribute('aria-label')||''));
    let n=b; for(let i=0;i<3&&n.parentElement;i++) n=n.parentElement;
    const va=[...n.querySelectorAll('button')].filter(v).find(e=>/View all/i.test(e.innerText||''));
    const R=(e)=>{const r=e.getBoundingClientRect();
      return {cx:Math.round(r.left+r.width/2),cy:Math.round(r.top+r.height/2)};};
    return {jump:R(b), viewAll:R(va)};
  });
  await page.mouse.click(pos.viewAll.cx,pos.viewAll.cy); await page.waitForTimeout(2500);
  await page.mouse.click(pos.jump.cx,pos.jump.cy);       await page.waitForTimeout(2500);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {clicksLanded:window.__clicks,
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(v).length,
      stillBanner:!![...document.querySelectorAll('button')].filter(v)
        .find(x=>/pin/i.test(x.getAttribute('aria-label')||''))};
  });
};
