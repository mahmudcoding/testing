// Alice sits in a DIFFERENT channel and watches the sidebar entry for #qa-general.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  const read = () => page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).find(x=>/qa-general/.test(x.innerText));
    if(!a) return 'ABSENT';
    const cs=getComputedStyle(a.querySelector('span,div')||a);
    return a.innerText.replace(/\s+/g,' ').trim()+' | fw='+cs.fontWeight;
  });
  const snaps=[];
  for(let i=0;i<95;i++){ await page.waitForTimeout(300); snaps.push(await read()); }
  const changes=[]; let prev=null;
  snaps.forEach((s,i)=>{ if(s!==prev){ changes.push({atMs:i*300, v:s}); prev=s; } });
  return {watched:'#qa-general sidebar entry', changes};
};
