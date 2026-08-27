export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(11000);
  const out={};
  out.archivedApi=await page.evaluate(async (ws)=>{
    const r=await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}&limit=100`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const a=(j&&(j.channels||j.items))||[];
    const mine=(Array.isArray(a)?a:[]).filter(c=>/^qa-c2-/.test(c.name||''));
    return {status:r.status, total:Array.isArray(a)?a.length:null,
      candidate:mine[0]?{id:mine[0].id,name:mine[0].name}:null};}, ws);
  const cand=out.archivedApi.candidate;
  if(!cand) return out;
  await page.locator('button[aria-label="Open archived channels"]').first().click({timeout:6000}).catch(()=>{out.openArchived='FAIL';});
  await page.waitForTimeout(5000);
  out.panel=await page.evaluate((name)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    let host=null;
    for (const e of document.querySelectorAll('*'))
      if(e.children.length===0 && (e.textContent||'').trim()===name){ host=e; break; }
    if(!host) return {hostFound:false,
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(v)
        .map(d=>(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,140))};
    let n=host, chain=[];
    for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n) break;
      const b=[...n.querySelectorAll('button')].filter(v)
        .map(x=>(x.getAttribute('aria-label')||x.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,22));
      if(b.length) chain.push(`up${i+1}: [${[...new Set(b)].join(' | ')}]`); }
    return {hostFound:true, ancestry:chain};}, cand.name);
  return {...out, candidate:cand};
};
