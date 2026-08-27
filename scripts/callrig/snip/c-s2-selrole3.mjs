export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
  await page.waitForTimeout(2500);
  const probe=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=[...document.querySelectorAll('button,[role="combobox"],select')].filter(v)
      .find(e=>/Select a role|Automatic role/i.test((e.getAttribute('aria-label')||e.innerText||'')));
    return {ctrl: c?{tag:c.tagName.toLowerCase(),
              aria:(c.getAttribute('aria-label')||'').slice(0,24),
              expanded:c.getAttribute('aria-expanded'),
              haspopup:c.getAttribute('aria-haspopup'),
              disabled:c.disabled===true||c.getAttribute('aria-disabled'),
              text:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)}:null,
            visibleEls:[...document.querySelectorAll('*')].filter(v).length,
            selects:document.querySelectorAll('select').length};
  });
  const before=await probe();
  await page.locator('button,[role="combobox"]').filter({hasText:'Select a role'}).first().click({timeout:6000});
  await page.waitForTimeout(3500);
  const after=await probe();
  return {before, after, deltaVisible: after.visibleEls-before.visibleEls};
};
