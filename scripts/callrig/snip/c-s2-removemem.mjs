export default async ({page}) => {
  const before = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/channels/C4QCPRIVATE0001/members',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const a=(j&&(j.members||j.items||j))||[];
    return {status:r.status, n:Array.isArray(a)?a.length:null};
  });
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,26));},true);});
  let click='no';
  try { await page.locator('button[aria-label="Remove QA Bob"]').first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,50); }
  await page.waitForTimeout(3500);
  const dlg = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)[0];
    return {landedOn:window.__c,
      dialog: d?{text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,180),
        buttons:[...d.querySelectorAll('button')].filter(v)
          .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24))}:null};
  });
  return {membersBefore:before, click, ...dlg};
};
