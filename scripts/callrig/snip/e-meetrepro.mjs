export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('request', r => { if (r.method()==='POST' && /calendar\/meetings/.test(r.url())) net.push({phase:'req', u:r.url().slice(-50)}); });
  page.on('response', async r => { if (/calendar\/meetings/.test(r.url()) && r.request().method()==='POST') net.push({phase:'res', s:r.status(), b:(await r.text().catch(()=>'')).slice(0,200)}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const countBefore = await page.evaluate(async () => {
    const r = await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j = await r.json(); return (j.meetings||[]).map(m=>({id:m.id,t:m.title,s:m.starts_at}));
  });
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator('main button:has-text("New meeting")').first().click();
  await page.waitForTimeout(2500);
  const dlg = page.locator('[role=dialog]').first();
  await dlg.locator('input').first().fill('QA-E Sync 2');
  await dlg.locator('input[aria-label="Starts time"]').fill('16:00');
  await page.waitForTimeout(300);
  await dlg.locator('input[aria-label="Ends time"]').fill('16:30');
  await page.waitForTimeout(500);
  // poll from BEFORE the click
  const samples=[];
  const snap = () => page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0 && getComputedStyle(e).visibility!=='hidden'; };
    const d=document.querySelector('[role=dialog]');
    const toasts=[...document.querySelectorAll('[role=status],[role=alert],[class*=toast],[data-sonner-toast]')].filter(vis).map(t=>t.innerText.replace(/\n/g,' ').slice(0,90));
    return {dlg: !!d && vis(d), chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length, toasts, t: performance.now()|0};
  });
  samples.push({tag:'pre', ...await snap()});
  const p = dlg.locator('button[type=submit]:has-text("Schedule meeting")').first().click();
  for (let i=0;i<24;i++){ await page.waitForTimeout(300); samples.push(await snap()); }
  await p.catch(()=>{});
  const countAfter = await page.evaluate(async () => {
    const r = await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j = await r.json(); return (j.meetings||[]).map(m=>({id:m.id,t:m.title,s:m.starts_at}));
  });
  return {countBefore, countAfter, net,
    dlgOpenAtEnd: samples[samples.length-1].dlg,
    chipsAtEnd: samples[samples.length-1].chips,
    toastsSeen: [...new Set(samples.flatMap(s=>s.toasts))],
    dlgTrace: samples.map(s=>s.dlg?1:0).join('')};
};
