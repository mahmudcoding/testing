export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  await page.locator('button').filter({hasText:/members/i}).first().click();
  await page.waitForTimeout(2500);
  out.structure=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40);
    if(!d) return 'no dialog';
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,260),
      tabs:[...d.querySelectorAll('[role="tab"]')].filter(vis).map(t=>(t.innerText||'').slice(0,18)),
      btns:[...d.querySelectorAll('button')].filter(vis)
        .map(b=>({l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,22), dis:b.disabled})).slice(0,16),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:i.getAttribute('placeholder'), type:i.type})),
      checkboxes:[...d.querySelectorAll('input[type=checkbox],[role=checkbox]')].filter(vis).length};});
  await page.keyboard.press('Escape');
  return out;
};
