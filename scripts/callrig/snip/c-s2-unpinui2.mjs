export default async ({page}) => {
  const out={};
  const btns=page.locator('button[aria-label="Unpin"]');
  out.unpinButtons=await btns.count();
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&/pin/i.test(u)) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,54));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,20));},true);});
  let click='no';
  try { await btns.first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,44); }
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.click=click; out.requests=reqs.slice(0,4);
  const r=await page.evaluate(async ()=>{
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    const res=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages/pinned',{credentials:'include'});
    const j=await res.json();
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.72&&b.width>250&&b.height>200;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return {landedOn:window.__c, serverTotal:j&&j.total,
      tab:[...document.querySelectorAll('button[aria-selected="true"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,12)).join(','),
      remaining:(pane?(pane.innerText||''):'').match(/QA-PINTAB-\w+/g)||[]};});
  return {...out, ...r};
};
