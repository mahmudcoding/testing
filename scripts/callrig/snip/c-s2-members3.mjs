export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const sel=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const t=[...document.querySelectorAll('button[aria-selected]')].filter(v)
      .map(e=>`${(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,12)}=${e.getAttribute('aria-selected')}`);
    return t.join(' ');});
  const steps={};
  steps.beforeOpen=await sel();
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3500);
  steps.afterOpen=await sel();
  await page.locator('button[aria-selected]').filter({hasText:/^Members/}).first().click({timeout:6000});
  await page.waitForTimeout(4000);
  steps.afterMembersClick1=await sel();
  const body1=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section,aside')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.7&&b.width>250&&b.height>300;})
      .sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
    return pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,300):'NO-PANE';});
  return {steps, membersPane:body1};
};
