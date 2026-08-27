export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const c=[...document.querySelectorAll('button,a,[role="button"]')].filter(vis)
      .filter(b=>/Message requests/i.test((b.getAttribute('aria-label')||'')+' '+(b.textContent||'')));
    c[0].setAttribute('data-qa-req','1');});
  await page.locator('[data-qa-req="1"]').click();
  await page.waitForTimeout(3000);
  out.dialog=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    if(!d) return 'none';
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...d.querySelectorAll('button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,22)),
      rows:d.querySelectorAll('[data-message-id]').length};});
  return out;
};
