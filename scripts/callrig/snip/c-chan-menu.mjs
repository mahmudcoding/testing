// Enumerate channel header menu options for a channel alice owns vs one she doesn't
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  for(const [name,id] of [['qa-general','C4QCGENERAL0001'],['qa-private','C4QCPRIVATE0001']]){
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
    await page.waitForTimeout(3800);
    const header = await page.evaluate(() => {
      const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
        let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
      const m=document.querySelector('main')||document.body;
      const top=[...m.querySelectorAll('button,a')].filter(vis).filter(b=>b.getBoundingClientRect().top<140)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,32)).filter(Boolean);
      return top;
    });
    out[name]={headerControls: header};
  }
  return out;
};
