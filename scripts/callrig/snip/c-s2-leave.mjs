export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXDIT33034G6M';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const out={};
  out.before=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    return {readStatus:r.status};}, ch);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3500);
  out.aboutControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    return [...new Set([...document.querySelectorAll('button')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.72)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,26)))]
      .filter(t=>/leave|archive|delete|save/i.test(t));});
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,42));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,22));},true);});
  let click='no';
  try { await page.locator('button').filter({hasText:/^Leave channel$/}).first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,40); }
  await page.waitForTimeout(3500);
  out.leaveClick=click;
  out.dialog=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)[0];
    return d?{text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,150),
      buttons:[...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22))}:null;});
  page.off('request',onReq);
  out.requests=reqs.slice(0,4);
  out.landed=await page.evaluate(()=>window.__c);
  return out;
};
