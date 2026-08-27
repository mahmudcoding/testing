export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
    let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, {waitUntil:'load'});
  await page.waitForTimeout(3800);
  await page.locator('button[aria-label="Channel details"]').first().click();
  await page.waitForTimeout(2500);
  const details = await page.evaluate(v => {
    const vv=eval('('+v+')');
    const panel=[...document.querySelectorAll('[role=dialog],aside,section')].filter(vv)
      .sort((a,b)=>b.innerText.length-a.innerText.length)[0];
    if(!panel) return {none:true};
    return {text: panel.innerText.replace(/\s+/g,' ').slice(0,700),
      btns:[...panel.querySelectorAll('button,a')].filter(vv).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,32)).filter(Boolean).slice(0,30)};
  }, V.toString());
  return details;
};
