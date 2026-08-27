export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r=>{const m=r.request().method(); if(m!=='GET' && /meeting/i.test(r.url())) net.push({m,u:r.url().replace('https://airion-cargo.store','').slice(0,55),s:r.status(),b:(await r.text().catch(()=>'')).slice(0,120)});});
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 2'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await chip.click(); await page.waitForTimeout(3200);
  const opened = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]');
    if(!d) return null;
    const btns=[...d.querySelectorAll('button')].filter(vis);
    const ed=btns.find(b=>/^Edit$/.test((b.getAttribute('aria-label')||b.innerText).trim()));
    if(ed) ed.click();
    return {had:!!ed, all:btns.map(b=>(b.getAttribute('aria-label')||b.innerText).trim()).slice(0,14)};
  });
  await page.waitForTimeout(3200);
  const form = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]');
    return d?{head:d.innerText.split('\n').filter(Boolean).slice(0,3).join(' | '),
      first:[...d.querySelectorAll('input')].filter(vis).slice(0,4).map(i=>({t:i.type,al:i.getAttribute('aria-label'),v:i.value})),
      submit:[...d.querySelectorAll('button[type=submit]')].filter(vis).map(b=>b.innerText.trim())}:null;
  });
  return {opened, form, net};
};
