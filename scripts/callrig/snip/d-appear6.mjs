export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  const radios = () => page.evaluate(()=>{const o={};document.querySelectorAll('main [role="radio"]').forEach(b=>{const t=(b.innerText||'').trim().slice(0,16); if(t)o[t]=b.getAttribute('aria-checked');});return o;});
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.before = await radios();
  // identify the exact element we are about to click
  res.targetInfo = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [role="radio"]')].filter(b=>(b.innerText||'').trim()==='Compact');
    return els.map(e=>({text:(e.innerText||'').trim(), checked:e.getAttribute('aria-checked'), group:(e.closest('[role="radiogroup"]')?.getAttribute('aria-label'))||(e.parentElement?.previousElementSibling?.innerText||'').trim().slice(0,24)}));
  });
  await page.locator('main [role="radio"]').filter({hasText:/^Compact$/}).first().click();
  await page.waitForTimeout(2500);
  res.activeAfterClick = await page.evaluate(()=>{const a=document.activeElement; return {text:(a?.innerText||'').trim().slice(0,20), role:a?.getAttribute('role'), checked:a?.getAttribute('aria-checked')};});
  res.after = await radios();
  // restore
  const orig = Object.entries(res.before).find(([k,v])=>v==='true' && ['Compact','Cozy','Comfortable'].includes(k));
  if (orig) { await page.locator('main [role="radio"]').filter({hasText:new RegExp('^'+orig[0]+'$')}).first().click(); await page.waitForTimeout(1800); }
  res.restored = await radios();
  return res;
};
