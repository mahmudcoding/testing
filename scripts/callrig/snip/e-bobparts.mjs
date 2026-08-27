export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r => {
    const u=r.url();
    if (/participant|attendee|calendar\/meetings\/|\/members/.test(u)) net.push({m:r.request().method(), u:u.replace('https://airion-cargo.store',''), s:r.status(), b:(await r.text().catch(()=>'')).slice(0,180)});
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 3'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await chip.click();
  const trace=[];
  for (let i=0;i<20;i++){
    await page.waitForTimeout(600);
    trace.push(await page.evaluate(()=>{const d=document.querySelector('[role=dialog]'); if(!d) return '-';
      const t=d.innerText; return /Participant list unavailable/.test(t)?'U':(/QA Alice|QA Bob/.test(t.split('Your response')[0])?'L':'?');}));
  }
  const final = await page.evaluate(()=>{const d=document.querySelector('[role=dialog]'); return d? d.innerText.replace(/\n{2,}/g,' | ').slice(0,500):null;});
  return {trace: trace.join(''), final, net: net.slice(0,12)};
};
