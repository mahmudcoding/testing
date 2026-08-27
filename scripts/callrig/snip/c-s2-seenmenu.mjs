export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OXEWL01S5558H';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const msg=page.locator(`[data-message-id="${id}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  out.receipt=await msg.evaluate(e=>{
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>2&&r.height>2;};
    const n=[...e.querySelectorAll('*')].filter(v)
      .find(x=>/^Seen by/i.test(x.getAttribute('aria-label')||''));
    return n?n.getAttribute('aria-label'):'none';});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000}).catch(()=>{out.menuFail=true});
  await page.waitForTimeout(3000);
  out.menuItems=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    if(!m) return 'NO-MENU';
    return [...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>`${(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22)}|exp=${b.getAttribute('aria-expanded')}`);});
  return out;
};
