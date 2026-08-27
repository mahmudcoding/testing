export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const btns=await page.$$('main button');
  let clicked=null;
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(/^Join/.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Join'};
  await page.waitForTimeout(4000);
  // possible pre-join dialog
  const d=await page.$$('[role="dialog"] button');
  for(const b of d){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(/^(Join call|Join now|Join)$/.test(l)){ await b.click(); break; } }
  await page.waitForTimeout(9000);
  return {clicked, topBar: await page.evaluate(()=>{const t=document.querySelector('[data-testid="call-top-bar"]');
    return t?t.innerText.replace(/\n+/g,' | ').slice(0,60):null;})};
};
