export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const runOnce=async(label)=>{
    const reqs=[];
    const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
    page.on('request',onReq);
    await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
    await page.waitForTimeout(10000);
    await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
    await page.waitForTimeout(3000);
    await page.locator('button[aria-selected]').filter({hasText:/^Members/}).first().click({timeout:6000});
    await page.waitForTimeout(4000);
    reqs.length=0;
    await page.locator('button[aria-label="Remove QA Bob"]').first().click({timeout:6000});
    await page.waitForTimeout(5000);
    const n=await page.evaluate(async ()=>{
      const r=await fetch('/api/v1/channels/C4QCPRIVATE0001/members',{credentials:'include'});
      const j=await r.json(); const a=(j&&(j.members||j))||[];
      return Array.isArray(a)?a.length:null;});
    page.off('request',onReq);
    return {label, apiCallsAfterClick:reqs.length, sample:reqs.slice(0,3), membersNow:n};
  };
  const a=await runOnce('fresh load #2');
  const b=await runOnce('fresh load #3');
  // alternative path: the member's profile card
  await page.locator('button[aria-label="Open QA Bob\'s profile"]').first().click({timeout:6000});
  await page.waitForTimeout(4000);
  const card=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    return [...new Set([...document.querySelectorAll('button,a,[role="menuitem"]')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.6)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>t&&t.length<34))].slice(0,20);});
  return {repro:[a,b], profileCardControls:card};
};
