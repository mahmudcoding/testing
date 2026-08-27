export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(4000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const heads=[...document.querySelectorAll('h1,h2,h3,h4,[role="heading"],[role="tab"]')].filter(v)
      .map(e=>`${e.tagName.toLowerCase()}@${Math.round(e.getBoundingClientRect().left)}: ${(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)}`);
    const dlg=[...document.querySelectorAll('[role="dialog"]')].filter(v)
      .map(e=>{const r=e.getBoundingClientRect();
        return {x:Math.round(r.left),w:Math.round(r.width),
                t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,150)};});
    return {headings:[...new Set(heads)].slice(0,16), dialogs:dlg};
  });
};
