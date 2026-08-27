export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r => { if (/calendar\/meetings/.test(r.url()) && r.request().method()==='POST') net.push({s:r.status(), b:(await r.text().catch(()=>'')).slice(0,160)}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator('main button:has-text("New meeting")').first().click();
  await page.waitForTimeout(2500);
  const dlg = page.locator('[role=dialog]').first();
  await dlg.locator('input').first().fill('QA-E Sync 3');
  await dlg.locator('input[aria-label="Starts time"]').fill('17:00');
  await page.waitForTimeout(300);
  await dlg.locator('input[aria-label="Ends time"]').fill('17:30');
  await page.waitForTimeout(400);
  await dlg.locator('button:has-text("QA Bob")').first().click();
  await page.waitForTimeout(1000);
  const selTxt = await dlg.innerText().then(t=>{const m=t.match(/Selected \(\d+\)/); return m?m[0]:'none';});
  const samples=[];
  const snap = () => page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0 && getComputedStyle(e).visibility!=='hidden'; };
    const d=document.querySelector('[role=dialog]');
    const toasts=[...document.querySelectorAll('[role=status],[role=alert],[class*=toast],[data-sonner-toast]')].filter(vis).map(t=>t.innerText.replace(/\n/g,' ').slice(0,90)).filter(Boolean);
    return {dlg: !!d && vis(d), chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length, toasts};
  });
  samples.push(await snap());
  const p = dlg.locator('button[type=submit]:has-text("Schedule meeting")').first().click();
  for (let i=0;i<26;i++){ await page.waitForTimeout(300); samples.push(await snap()); }
  await p.catch(()=>{});
  const errTxt = await page.evaluate(() => { const d=document.querySelector('[role=dialog]'); return d? d.innerText.replace(/\n{2,}/g,' | ').slice(0,500) : null; });
  const after = await page.evaluate(async () => {
    const r = await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j=await r.json(); return (j.meetings||[]).map(m=>m.title+' @'+m.starts_at);
  });
  return {selTxt, net, dlgTrace: samples.map(s=>s.dlg?1:0).join(''), chipsTrace: samples.map(s=>s.chips).join(''), toasts:[...new Set(samples.flatMap(s=>s.toasts))], errTxt, after};
};
