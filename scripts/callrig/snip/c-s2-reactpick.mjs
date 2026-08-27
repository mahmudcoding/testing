export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const msg=page.locator('main [data-message-id]').last();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  const btn=msg.locator('button[aria-label="Add reaction"]').first();
  const out={btnCount:await btn.count()};
  try { await btn.click({timeout:6000}); out.click='ok'; } catch(e){ out.click='FAIL'; return out; }
  await page.waitForTimeout(3500);
  out.picker=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const cands=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(v);
    return cands.slice(0,2).map(d=>{const b=d.getBoundingClientRect();
      return {size:`${Math.round(b.width)}x${Math.round(b.height)}`,
        buttons:d.querySelectorAll('button').length,
        firstLabels:[...d.querySelectorAll('button')].filter(v).slice(0,6)
          .map(x=>`${(x.getAttribute('aria-label')||'(none)')}|${(x.innerText||'').trim().slice(0,4)}`),
        text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)};});});
  return out;
};
