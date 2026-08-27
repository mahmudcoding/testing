export default async ({page}) => {
  const rd=()=>page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const grid=r.querySelector('[role="group"][aria-label="Call participants"]');
    const vt=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-view-toggle');
    const tiles=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(b=>{
      let n=b,best=b; while(n&&n!==r){const q=n.getBoundingClientRect(); if(q.width>120&&q.height>90){best=n;break;} n=n.parentElement;}
      const q=best.getBoundingClientRect();
      return (b.getAttribute('aria-label')||'').replace('Participant actions for ','')+' '+Math.round(q.width)+'x'+Math.round(q.height)+' @'+Math.round(q.left)+','+Math.round(q.top);});
    return {layout:grid?grid.getAttribute('data-grid-layout'):null, viewLabel:vt?vt.getAttribute('aria-label'):null, tiles};
  });
  const before = await rd();
  // open Bob's tile menu and Pin for me
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].find(x=>/QA Bob/.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(1500);
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const pick=c[c.length-1]; if(!pick) return {err:'no menu'};
    const it=[...pick.querySelectorAll('button,[role="menuitem"]')].filter(vis).find(x=>/^Pin for me$/i.test((x.textContent||'').trim()));
    if(!it) return {err:'no Pin for me', had:[...pick.querySelectorAll('button')].map(x=>(x.textContent||'').trim()).slice(0,12)};
    it.click(); return {ok:true};
  });
  await page.waitForTimeout(3500);
  const after = await rd();
  // reopen menu to read the toggled label
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].find(x=>/QA Bob/.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(1500);
  const menuNow = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const pick=c[c.length-1]; return pick?[...pick.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,30)).slice(0,6):null;
  });
  return {before, clicked, after, menuAfterPin: menuNow};
};
