export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  // clear unread first: open qa-general, then move away to qa-private
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`, {waitUntil:'load'});
  await page.waitForTimeout(3500);
  const read = () => page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).find(x=>/qa-general/.test(x.innerText));
    return a? (a.getAttribute('aria-label')||a.innerText.replace(/\s+/g,' ').trim()) : 'ABSENT';
  });
  const t0=Date.now(); const snaps=[];
  for(let i=0;i<140;i++){ await page.waitForTimeout(300); snaps.push({t:Date.now()-t0, v:await read()}); }
  const ch=[]; let prev=null;
  for(const s of snaps){ if(s.v!==prev){ ch.push(s); prev=s.v; } }
  return {startedCleared: snaps[0].v, changes: ch, visibility: await page.evaluate(()=>document.visibilityState)};
};
