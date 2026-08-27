const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', A='C4QCGENERAL0001';
  const out={};
  const chip=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const hits=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && v(e))
      .map(e=>(e.textContent||'').trim()).filter(t=>/Ready to send/.test(t));
    return {chips:hits.slice(0,3), n:hits.length};});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`);
  await page.waitForTimeout(9000);
  out.beforeAttach=await chip();
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-m3.txt`);
  await page.waitForTimeout(3500);
  out.afterAttachInA=await chip();
  const side=page.locator('nav a, aside a').filter({hasText:'qa-c2-deep'}).first();
  await side.click(); await page.waitForTimeout(6500);
  out.inOtherChannel=await chip();
  const back=page.locator('nav a, aside a').filter({hasText:'qa-general'}).first();
  await back.click(); await page.waitForTimeout(6500);
  out.backInA=await chip();
  // clean up: remove the pending attachment if a remove control exists
  const rm=page.locator('button[aria-label*="Remove"], button[aria-label*="remove"]').first();
  out.removeControl=await rm.count();
  if(out.removeControl){ await rm.click(); await page.waitForTimeout(1500); out.afterRemove=await chip(); }
  return out;
};
