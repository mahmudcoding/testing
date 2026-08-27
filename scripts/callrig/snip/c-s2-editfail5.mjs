export default async ({page}) => {
  const out={};
  const box=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  out.before=await box.evaluate(e=>e.innerText.trim().slice(0,30));
  await page.route('**/api/v1/messaging/**', r=>{
    const m=r.request().method();
    return (m==='PATCH'||m==='PUT'||m==='POST') ? r.abort('failed') : r.continue();});
  const seen=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&/messag/.test(u))
    seen.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  let click='no';
  try { await page.locator('button[aria-label="Save changes"]').first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,40); }
  await page.waitForTimeout(8000);
  page.off('request',onReq);
  await page.unroute('**/api/v1/messaging/**');
  out.click=click; out.requests=seen.slice(0,3);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const btns=[...document.querySelectorAll('button[aria-label]')].filter(v)
      .map(b=>b.getAttribute('aria-label')).filter(t=>/Save changes|Cancel editing|^Send$/.test(t));
    return {composerText:c?(c.innerText||'').trim().slice(0,30):'no composer',
      modeButtons:[...new Set(btns)],
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,52)).filter(Boolean).slice(0,3)};});
  return out;
};
