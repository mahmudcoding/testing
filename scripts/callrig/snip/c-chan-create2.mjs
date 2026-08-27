export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Add channel"]').first().click();
  await page.waitForTimeout(2000);
  const step1 = await page.evaluate(v=>{const vv=eval(v);
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vv)[0];
    if(!d) return {none:true};
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,400),
      inputs:[...d.querySelectorAll('input,textarea')].map(e=>({type:e.type,ph:e.placeholder||e.getAttribute('aria-label')||'',val:e.value,max:e.maxLength})),
      btns:[...d.querySelectorAll('button')].filter(vv).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,28),dis:b.disabled}))};}, V);
  return step1;
};
