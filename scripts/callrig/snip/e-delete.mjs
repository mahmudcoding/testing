export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r=>{const m=r.request().method(); if(m!=='GET' && /meeting/i.test(r.url())) net.push({m,u:r.url().replace('https://airion-cargo.store','').slice(0,50),s:r.status()});});
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j=await r.json(); return (j.meetings||[]).map(m=>m.title);
  });
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 2'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await chip.click(); await page.waitForTimeout(3500);
  const pos = await page.evaluate(()=>{
    const d=document.querySelector('[role=dialog]');
    const b=[...d.querySelectorAll('button')].find(x=>/^Delete$/.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};
  });
  if(!pos) return {noDeleteBtn:true};
  await page.mouse.click(pos.x,pos.y);
  await page.waitForTimeout(2500);
  const confirm = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vis);
    return {n:ds.length, heads:ds.map(d=>d.innerText.split('\n').filter(Boolean).slice(0,3).join(' | ').slice(0,140)),
      btns:ds.flatMap(d=>[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).trim())).slice(0,12)};
  });
  return {before, confirm, net};
};
