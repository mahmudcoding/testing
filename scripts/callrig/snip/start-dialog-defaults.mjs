export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1800);
  return await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {
      text: dlg.innerText.replace(/\n+/g,' | ').slice(0,800),
      controls: [...dlg.querySelectorAll('button,input')].map(c=>`${(c.getAttribute('aria-label')||c.textContent||'').trim().slice(0,34)}#${c.getAttribute('data-testid')||c.id||'-'}${c.getAttribute('aria-checked')!=null?' ac='+c.getAttribute('aria-checked'):''}${c.type?' t='+c.type:''}`)
    };
  });
};
