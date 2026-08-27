export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 3'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await chip.click(); await page.waitForTimeout(3000);
  out.card = await page.evaluate(() => {
    const d=document.querySelector('[role=dialog]');
    return d? d.innerText.replace(/\n{2,}/g,' | ').slice(0,700):null;
  });
  // wait longer, re-sample: is it transient?
  await page.waitForTimeout(6000);
  out.cardAfter6s = await page.evaluate(() => {
    const d=document.querySelector('[role=dialog]');
    return d? d.innerText.replace(/\n{2,}/g,' | ').slice(0,700):null;
  });
  out.api = await page.evaluate(async () => {
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j=await r.json();
    const m=(j.meetings||[]).find(x=>x.title==='QA-E Sync 3');
    return m? {keys:Object.keys(m).join(','), participants:m.participants, invitees:m.invitees, attendees:m.attendees}:null;
  });
  return out;
};
