export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const m=r.request().method(); if(m!=='GET' && /meeting/i.test(r.url())) net.push({m,u:r.url().replace('https://airion-cargo.store','').slice(0,50),s:r.status()});});
  const btn = page.locator('[role=alertdialog] button, [role=dialog] button').filter({hasText:/^Delete meeting$/}).first();
  if(!(await btn.count())) return {err:'confirm dialog gone — rerun e-delete.mjs'};
  const samples=[];
  const snap=()=>page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return {dlgs:[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vis).length,
      chips:document.querySelectorAll('button[data-testid="calendar-event-chip"]').length};
  });
  samples.push(await snap());
  await btn.click();
  for(let i=0;i<16;i++){ await page.waitForTimeout(500); samples.push(await snap()); }
  const after = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j=await r.json(); return (j.meetings||[]).map(m=>m.title);
  });
  return {net, dlgTrace:samples.map(s=>s.dlgs).join(''), chipTrace:samples.map(s=>s.chips).join(''), apiAfter:after};
};
