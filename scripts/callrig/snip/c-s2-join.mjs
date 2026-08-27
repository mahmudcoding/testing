export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXDCYXHMO0YQ6', name='qa-c2-join-lr49';
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=channels`);
  await page.waitForTimeout(11000);
  const out={};
  out.beforeMember=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {readStatus:r.status, key:j&&j.key};}, ch);
  // find the row for our channel
  const row=page.locator('tr,li,div').filter({hasText:name}).last();
  out.rowFound=await row.count();
  try { await row.scrollIntoViewIfNeeded({timeout:4000}); } catch {}
  await page.waitForTimeout(1500);
  out.rowControls=await page.evaluate((name)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const nodes=[...document.querySelectorAll('tr,li,div')].filter(v)
      .filter(e=>(e.innerText||'').includes(name) && (e.innerText||'').length<200);
    const host=nodes[nodes.length-1];
    if(!host) return 'row not found';
    return [...new Set([...host.querySelectorAll('button,a')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,26)))];
  }, name);
  return out;
};
