export default async ({page}) => {
  const cur = await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^(Raise hand|Lower hand)$/i.test(x.getAttribute('aria-label')||''));
    return b?b.getAttribute('aria-label'):null;});
  if (cur === 'Lower hand'){   // ensure it starts down
    await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const b=[...r.querySelectorAll('button')].find(x=>/^Lower hand$/i.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
    await page.waitForTimeout(3000);
  }
  const beforeRaise = await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^(Raise hand|Lower hand)$/i.test(x.getAttribute('aria-label')||''));
    return b?b.getAttribute('aria-label'):null;});
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^Raise hand$/i.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(5000);
  const afterRaise = await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^(Raise hand|Lower hand)$/i.test(x.getAttribute('aria-label')||''));
    return {btn:b?b.getAttribute('aria-label'):null, pressed:b?b.getAttribute('aria-pressed'):null};});
  return {cur, beforeRaise, afterRaise};
};
