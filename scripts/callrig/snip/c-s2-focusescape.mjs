export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const state=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const trigger=document.querySelector('button[aria-label="Channel details"]');
    const cands=[...document.querySelectorAll('aside,[role="dialog"],section,div')].filter(v)
      .filter(d=>/About/.test(d.innerText||'') && /Members/.test(d.innerText||''))
      .filter(d=>!(trigger && d.contains(trigger)));
    cands.sort((a,b)=>(a.getBoundingClientRect().width*a.getBoundingClientRect().height)
                     -(b.getBoundingClientRect().width*b.getBoundingClientRect().height));
    const a=document.activeElement;
    return {panelOpen:!!cands[0],
      active:a?(a.getAttribute('aria-label')||(a.innerText||'').trim().slice(0,20)||a.tagName):null,
      activeIsTrigger:a===trigger};});
  const btn=page.locator('button[aria-label="Channel details"]').first();
  await btn.focus();
  out.beforeOpen=await state();
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  out.afterOpen=await state();
  await page.keyboard.press('Escape'); await page.waitForTimeout(2000);
  out.afterEscape=await state();
  return out;
};
