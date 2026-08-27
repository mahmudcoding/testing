export default async ({page}) => {
  const btns=await page.$$('main button');
  let clicked=null;
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(/^Join/.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Join button', labels:(await Promise.all(btns.slice(0,12).map(async b=>((await b.innerText())||'').trim().slice(0,20))))};
  await page.waitForTimeout(6000);
  const d=await page.$$('[role="dialog"]');
  for(const b of (d.length?await d[d.length-1].$$('button'):[])){
    const l=(((await b.getAttribute('aria-label'))||(await b.textContent())||'')).trim();
    if(/^(Join|Join call|Join now)$/.test(l)){ await b.click(); break; } }
  await page.waitForTimeout(9000);
  return {clicked, top: await page.evaluate(()=>{const t=document.querySelector('[data-testid="call-top-bar"]');
    return t?t.innerText.replace(/\n+/g,' | ').slice(0,55):null;})};
};
