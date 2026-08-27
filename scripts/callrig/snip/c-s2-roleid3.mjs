export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out=[];
  for (const ch of ['C4QCGENERAL0001','C4QCPRIVATE0001']) {
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(9000);
    try {
      await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
      await page.waitForTimeout(2500);
      await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
      await page.waitForTimeout(3000);
    } catch(e) { out.push({ch:ch.slice(0,8), err:'no roles tab'}); continue; }
    out.push(await page.evaluate((ch)=>{
      const rows=[];
      const walk=(n)=>{ for(const c of n.childNodes){
          if(c.nodeType===3 && /^R4Q[A-Z0-9]{10,}$/.test((c.textContent||'').trim()))
            rows.push({id:(c.textContent||'').trim(),
                       block:(c.parentElement&&c.parentElement.parentElement&&
                              (c.parentElement.parentElement.innerText||'').replace(/\s+/g,' ').trim().slice(0,50))||''});
          else if(c.nodeType===1) walk(c); } };
      walk(document.body);
      return {ch:ch.slice(0,8), rawIdsShown:rows.length, sample:rows.slice(0,2)};
    }, ch));
  }
  return out;
};
