export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    return [...main.querySelectorAll('[role=switch]')].filter(vis).map((s,i)=>{
      // nearest preceding text node block
      let lab=s.getAttribute('aria-label')||'';
      if(!lab){
        let n=s, guard=0;
        while(n && guard++<8){
          const prev=n.previousElementSibling;
          if(prev){ const t=(prev.innerText||'').trim(); if(t){lab=t;break;} }
          n=n.parentElement;
        }
      }
      const id=s.getAttribute('aria-labelledby');
      if(!lab && id){ const e=document.getElementById(id); if(e) lab=(e.innerText||'').trim(); }
      return {i, label:lab.replace(/\s+/g,' ').slice(0,50), on:s.getAttribute('aria-checked')};
    });
  });
};
