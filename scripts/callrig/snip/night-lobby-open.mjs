export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const btns=await page.$$('main button');
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(/^Join/.test(l)){ await b.click(); break; } }
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    if(!d) return {none:true};
    return {text:d.innerText.replace(/\n+/g,' | ').slice(0,260),
      buttons:[...d.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,34), tid:b.getAttribute('data-testid')})),
      selects:[...d.querySelectorAll('select')].map(s=>({opts:[...s.options].map(o=>o.text.slice(0,26)), val:s.selectedIndex}))};});
};
