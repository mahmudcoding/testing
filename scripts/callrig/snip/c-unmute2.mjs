export default async ({page}) => {
  const ws='W4QCF1XTURESO01', id='C4QCGENERAL0001';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const reqs=[]; page.on('response', r=>{if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET') reqs.push(r.request().method()+' '+r.url().replace(/^https?:\/\/[^/]+/,'')+' → '+r.status());});
  await page.locator('button[aria-label="Unmute notifications"]').first().click();
  await page.waitForTimeout(1500);
  const popup = await page.evaluate(v=>{const vv=eval(v);
    const m=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vv);
    const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return {popups:m.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,140)),
      btn:b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed')}:null};}, V);
  // if a popup offers Unmute, click it
  let picked=null;
  const un = page.getByText('Unmute', {exact:false}).last();
  if(popup.popups.length && await un.count()){ try{ await un.click({timeout:5000}); picked='clicked Unmute in popup'; await page.waitForTimeout(2000);}catch(e){picked='popup click failed';} }
  const after = await page.evaluate(()=>{const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed')}:null;});
  return {popupAfterClick: popup, picked, finalBtn: after, apiWrites: reqs};
};
