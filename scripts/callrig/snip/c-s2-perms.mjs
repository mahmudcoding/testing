export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
  await page.waitForTimeout(3000);
  return page.evaluate(async (ch)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const tabBtns=[...document.querySelectorAll('button,a')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.72)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>t&&t.length<34);
    const r=await fetch(`/api/v1/channels/${ch}/permissions/available`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const perms=(j&&(j.permissions||j.items))||[];
    return {rolesTabControls:[...new Set(tabBtns)].slice(0,14),
      permsStatus:r.status, permCount:Array.isArray(perms)?perms.length:null,
      permSample:JSON.stringify(Array.isArray(perms)?perms.slice(0,3):perms).slice(0,300)};
  }, ch);
};
