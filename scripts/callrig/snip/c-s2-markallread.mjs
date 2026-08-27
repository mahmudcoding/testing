export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  await page.waitForTimeout(10000);
  const tabs=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>/^(All|Unread) \(\d+\)$/.test(t));});
  const out={before:await tabs()};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,20));},true);});
  page.on('request',onReq);
  let click='no';
  try { await page.locator('button').filter({hasText:/^Mark all read$/}).first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,40); }
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.click=click; out.requests=reqs.slice(0,4);
  out.landed=await page.evaluate(()=>window.__c);
  out.after=await tabs();
  await page.reload(); await page.waitForTimeout(9000);
  out.afterReload=await tabs();
  return out;
};
