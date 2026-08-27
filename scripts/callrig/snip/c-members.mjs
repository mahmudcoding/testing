export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(3800);
  await page.locator('button[aria-label="Channel details"]').first().click();
  await page.waitForTimeout(2000);
  const mb = page.locator('button').filter({hasText:/^Members \d+$/}).last();
  if(await mb.count()) { await mb.click(); await page.waitForTimeout(2200); }
  return await page.evaluate(v=>{const vv=eval(v);
    const panel=[...document.querySelectorAll('[role=dialog],aside,section,div')].filter(vv)
      .filter(p=>/Members/.test(p.innerText||'') && p.innerText.length<1200)
      .sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!panel) return {none:true};
    const leaves=[...panel.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>e.textContent.trim().slice(0,50));
    return {text:panel.innerText.replace(/\s+/g,' ').slice(0,320),
      leaves:leaves.slice(0,22),
      straySlash: leaves.filter(t=>/^\s*[\/·]/.test(t))};}, V);
};
