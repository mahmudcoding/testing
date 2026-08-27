export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  // find the entry point for creating a channel
  const entry = await page.evaluate(v=>{const vv=eval(v);
    return [...document.querySelectorAll('button,a')].filter(vv)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,34))
      .filter(t=>/channel|create|add|new|\+/i.test(t)).slice(0,20);}, V);
  return {entryCandidates: entry};
};
