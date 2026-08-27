export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const reqs=[]; page.on('response', async r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,200);}catch(e){}
    reqs.push(r.request().method()+' '+r.url().replace(/^https?:\/\/[^/]+/,'')+' → '+r.status()+' '+b);}});
  await page.locator('[role=dialog] button', {hasText:/^Leave$/}).first().click();
  const series=[];
  for(let i=0;i<18;i++){ await page.waitForTimeout(300);
    series.push(await page.evaluate(v=>{const vv=eval(v);
      return {url:location.pathname,
        toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vv).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,110)).filter(Boolean),
        sidebar:[...document.querySelectorAll('a[href*="/c/"]')].filter(vv).map(a=>a.innerText.replace(/\s+/g,' ').trim()).slice(0,8),
        dlg:[...document.querySelectorAll('[role=dialog]')].filter(vv).length};}, V)); }
  const uniq=[]; for(const s of series){const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push(s);}
  return {states: uniq, apiWrites: reqs};
};
