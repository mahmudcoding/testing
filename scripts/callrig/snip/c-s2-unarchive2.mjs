export default async ({page}) => {
  const ws='W4QCF1XTURESO01', id='C4OXDBL0NATFUK4', name='qa-c2-rm-xyok';
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,20));},true);});
  const h=await page.evaluateHandle((name)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    let host=null;
    for (const e of document.querySelectorAll('*'))
      if(e.children.length===0 && (e.textContent||'').trim()===name){ host=e; break; }
    if(!host) return null;
    let n=host;
    for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n) break;
      const b=[...n.querySelectorAll('button')].filter(v)
        .find(x=>/^unarchive$/i.test((x.innerText||x.getAttribute('aria-label')||'').trim()));
      if(b) return b; }
    return null;}, name);
  const el=h.asElement();
  let click='no-button';
  if(el){ try{ await el.click({timeout:6000}); click='ok'; }catch(e){ click='FAIL'; } }
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  const after=await page.evaluate(async ({ws,id})=>{
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    const r=await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}&limit=100`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.channels||j.items))||[];
    const stillArchived=(Array.isArray(a)?a:[]).some(c=>c.id===id);
    const inSidebar=[...document.querySelectorAll('a[href*="/c/"]')].filter(v)
      .some(x=>(x.getAttribute('href')||'').includes(id));
    return {landed:window.__c, stillArchived, archivedCount:Array.isArray(a)?a.length:null, inSidebar};},
    {ws,id});
  return {click, requests:reqs.slice(0,5), ...after};
};
