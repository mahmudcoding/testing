export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const probe = () => page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const all=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vis(e));
    const has = re => all.filter(e=>re.test(e.textContent)).map(e=>e.textContent.trim().slice(0,45));
    return {pin:has(/Pinned message|no message text|View all/i), start:has(/Start this channel|Add teammates/i),
            msgs:document.querySelectorAll('[data-message-id]').length};
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const before = await probe();
  await page.locator('button[aria-label="Channel details"]').first().click();
  const series=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(300); series.push(await probe()); }
  const uniq=[]; for(const s of series){const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push({at:'~'+((uniq.length+1))+'',...s});}
  return {before, afterDetailsClick: uniq};
};
