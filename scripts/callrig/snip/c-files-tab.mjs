export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(3500);
  await page.locator('button[aria-label="Channel details"]').first().click();
  await page.waitForTimeout(1800);
  const ok = await page.evaluate(v=>{const vv=eval(v);
    const t=[...document.querySelectorAll('[role=tab]')].filter(vv).find(x=>/^Files/.test((x.innerText||'').trim()));
    if(!t) return 'no Files tab'; t.click(); return 'clicked';}, V);
  await page.waitForTimeout(2500);
  return await page.evaluate(v=>{const vv=eval(v);
    const leaves=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>({t:e.textContent.trim().slice(0,45), y:Math.round(e.getBoundingClientRect().top), x:Math.round(e.getBoundingClientRect().left)}))
      .filter(o=>o.x>900 && o.y>70);
    return {clicked:'ok', tabs:[...document.querySelectorAll('[role=tab]')].filter(vv).map(x=>x.innerText.trim()+':'+x.getAttribute('aria-selected')),
      panel:leaves.slice(0,16), hasUploaded: leaves.some(o=>/attach|\.png/i.test(o.t))};}, V);
};
