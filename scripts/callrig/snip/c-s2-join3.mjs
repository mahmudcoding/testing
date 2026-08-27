export default async ({page}) => {
  const ch='C4OXDCYXHMO0YQ6', name='qa-c2-join-lr49';
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,46));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,20));},true);});
  const joinBtn=await page.evaluateHandle((name)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    let host=null;
    for (const e of document.querySelectorAll('*'))
      if(e.children.length===0 && (e.textContent||'').trim()===name){ host=e; break; }
    if(!host) return null;
    let n=host;
    for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n) break;
      const b=[...n.querySelectorAll('button')].filter(v)
        .find(x=>/^join$/i.test((x.innerText||x.getAttribute('aria-label')||'').trim()));
      if(b) return b; }
    return null;}, name);
  const el=joinBtn.asElement();
  let click='no-button';
  if(el){ try{ await el.click({timeout:6000}); click='ok'; }catch(e){ click='FAIL'; } }
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  const after=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=2`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    const inSidebar=[...document.querySelectorAll('a[href*="/c/"]')].filter(v)
      .some(a=>(a.getAttribute('href')||'').includes(ch));
    return {landed:window.__c, readStatus:r.status, key:j&&j.key,
      msgs:j&&j.messages?j.messages.length:null, inSidebar};}, ch);
  return {click, requests:reqs.slice(0,5), ...after};
};
