export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('main button').filter({hasText:/^Month$/}).first().click();
  await page.waitForTimeout(3500);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const chips=[...document.querySelectorAll('[data-testid="calendar-month-event-chip"]')];
    // find the cell containing them
    let cell = chips[0];
    for(let i=0;i<6 && cell;i++){ cell=cell.parentElement; if(cell && cell.innerText.trim().startsWith('26')) break; }
    const cellTxt = cell? cell.innerText.replace(/\n+/g,' | ').slice(0,260) : null;
    // all visible buttons/links in that cell
    const cellBtns = cell? [...cell.querySelectorAll('button,a,[role=button]')].filter(vis)
      .map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\n/g,' ').trim().slice(0,60), tid:b.getAttribute('data-testid')})) : [];
    // anything looking like overflow anywhere on the page
    const overflow=[...document.querySelectorAll('button,a,span,div')].filter(vis)
      .filter(e=>e.children.length===0 && /^\+\s*\d|\d+\s*more|ещё/i.test(e.textContent.trim()))
      .map(e=>e.textContent.trim().slice(0,30));
    return {chipTexts:chips.map(c=>c.innerText.replace(/\n/g,' ').trim().slice(0,50)),
      cellTxt, cellBtns, overflow, cellChipCount:chips.length};
  });
};
