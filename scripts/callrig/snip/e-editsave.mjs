export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r=>{const m=r.request().method(); if(m!=='GET'&&/meeting/i.test(r.url())) net.push({m,u:r.url().replace('https://airion-cargo.store','').slice(0,50),s:r.status()});});
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 1'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
  await chip.click(); await page.waitForTimeout(3000);
  const pos = await page.evaluate(()=>{
    const d=document.querySelector('[role=dialog]');
    const b=[...d.querySelectorAll('button')].find(x=>/^Edit$/.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};
  });
  if(!pos) return {noEdit:true};
  await page.mouse.click(pos.x,pos.y);
  await page.waitForTimeout(3500);
  const ed = page.locator('[role=dialog]').filter({hasText:'Edit meeting'}).first();
  await ed.locator('input').first().fill('QA-E Sync 1 renamed');
  await page.waitForTimeout(600);
  await ed.locator('button:has-text("Save")').first().click();
  await page.waitForTimeout(4500);
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j=await r.json(); return (j.meetings||[]).map(m=>m.title);
  });
  const chips = await page.evaluate(()=>[...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].map(c=>c.innerText.replace(/\n/g,' ').slice(0,32)));
  return {net, apiTitles:api, chips};
};
