export default async ({page}) => {
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(600);
  await page.locator('button[aria-label^="Search QA"]').first().click();
  await page.waitForTimeout(2000);
  await page.locator('[role=dialog] button:has-text("Open full search")').first().click();
  await page.waitForTimeout(3500);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main')||document.body;
    return {url:location.pathname+location.search,
      txt:m.innerText.replace(/\n{2,}/g,' | ').slice(0,500),
      btns:[...m.querySelectorAll('button,[role=tab]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).replace(/\n/g,' ').trim()).filter(Boolean).slice(0,20),
      inputs:[...m.querySelectorAll('input')].filter(vis).map(i=>i.placeholder||i.getAttribute('aria-label'))};
  });
};
