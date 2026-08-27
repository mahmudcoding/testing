export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const snap=()=>page.evaluate(()=>{
    const vis=(e)=>{ const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05; };
    const els=[...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')];
    return els.filter(e=>/no longer have access/i.test(e.innerText||'')).map(e=>{
      const r=e.getBoundingClientRect();
      const hit=document.elementFromPoint(Math.round(r.left+r.width/2), Math.round(r.top+r.height/2));
      return {tag:e.tagName, role:e.getAttribute('role'), sonner:e.hasAttribute('data-sonner-toast'),
        cls:(e.className||'').toString().slice(0,40),
        rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],
        vis:vis(e), hitIsSelf: !!(hit && (hit===e || e.contains(hit))),
        txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,50)};});});
  const t0=Date.now(); const found=[];
  while(Date.now()-t0 < 70000){
    const s=await snap();
    if(s.length){ found.push({at:+((Date.now()-t0)/1000).toFixed(1), n:s.length, els:s}); 
      if(found.length>=3) break; }
    await page.waitForTimeout(700);
  }
  return {found};
};
