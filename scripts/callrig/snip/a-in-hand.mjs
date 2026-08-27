export default async ({page}) => {
  const b4 = await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^(Raise hand|Lower hand)$/i.test(x.getAttribute('aria-label')||''));
    return b?{label:b.getAttribute('aria-label'),pressed:b.getAttribute('aria-pressed')}:{err:'no hand btn'};});
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^Raise hand$/i.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^(Raise hand|Lower hand)$/i.test(x.getAttribute('aria-label')||''));
    return {btn:b?{label:b.getAttribute('aria-label'),pressed:b.getAttribute('aria-pressed')}:null,
      tail:((r.innerText||'').replace(/\n+/g,' | ')).slice(0,180)};});
  return {b4, after};
};
