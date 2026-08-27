export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('button', {hasText:/^Members/}).first().click({timeout:6000});
  await page.waitForTimeout(6000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const inPane=(e)=>e.getBoundingClientRect().left>W*0.7;
    const ctrls=[...document.querySelectorAll('button,a,input,select')].filter(v).filter(inPane)
      .map(e=>`${e.tagName.toLowerCase()}:${(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').replace(/\s+/g,' ').trim().slice(0,32)}`);
    const leaves=[...document.querySelectorAll('p,span,div,li,td')].filter(v).filter(inPane)
      .filter(e=>e.children.length===0)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40);
    return {controls:[...new Set(ctrls)].slice(0,18), text:[...new Set(leaves)].slice(0,20)};
  });
};
