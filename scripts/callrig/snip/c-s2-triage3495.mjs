export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8500);
  const probe=()=>page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const sc=[...document.querySelectorAll('main *')].filter(e=>e.scrollHeight>e.clientHeight+40)[0];
    const all=[...document.querySelectorAll('button')].filter(vis)
      .filter(b=>b.getBoundingClientRect().x>380);
    const cand=all.filter(b=>{const r=b.getBoundingClientRect();
      return r.width<70 && r.height<70 && r.y>window.innerHeight*0.5 && r.y<window.innerHeight-60;});
    return {gap: sc? Math.round(sc.scrollHeight-sc.scrollTop-sc.clientHeight):null,
      candidates:cand.map(b=>({l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,18),
        y:Math.round(b.getBoundingClientRect().y), x:Math.round(b.getBoundingClientRect().x)}))};});
  // scroll fully to bottom
  await page.evaluate(()=>{const sc=[...document.querySelectorAll('main *')].filter(e=>e.scrollHeight>e.clientHeight+40)[0];
    if(sc) sc.scrollTop=sc.scrollHeight;});
  await page.waitForTimeout(2500);
  out.atBottom=await probe();
  // scroll up
  await page.evaluate(()=>{const sc=[...document.querySelectorAll('main *')].filter(e=>e.scrollHeight>e.clientHeight+40)[0];
    if(sc) sc.scrollTop=Math.max(0, sc.scrollTop-1500);});
  await page.waitForTimeout(2500);
  out.scrolledUp=await probe();
  // back to bottom
  await page.evaluate(()=>{const sc=[...document.querySelectorAll('main *')].filter(e=>e.scrollHeight>e.clientHeight+40)[0];
    if(sc) sc.scrollTop=sc.scrollHeight;});
  await page.waitForTimeout(3000);
  out.backAtBottom=await probe();
  return out;
};
