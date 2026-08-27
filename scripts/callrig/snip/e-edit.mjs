export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r=>{const m=r.request().method(); if(m!=='GET' && /meeting/i.test(r.url())) net.push({m,u:r.url().replace('https://airion-cargo.store','').slice(0,60),s:r.status(),b:(await r.text().catch(()=>'')).slice(0,140)});});
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 2'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
  await chip.click(); await page.waitForTimeout(2800);
  const card = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]');
    return d? {txt:d.innerText.replace(/\n{2,}/g,' | ').slice(0,400),
      btns:[...d.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).trim()).filter(Boolean).slice(0,20)}:null;
  });
  return {card, net};
};
