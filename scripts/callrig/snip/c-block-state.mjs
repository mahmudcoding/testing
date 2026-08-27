export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const api = await page.evaluate(async () => {
    const out={};
    for(const u of ['/api/v1/messaging/users/blocked','/api/v1/users/me/blocked','/api/v1/messaging/users/blocks']){
      const r=await fetch(u,{credentials:'include'});
      out[u]={s:r.status, b:(await r.text()).slice(0,300)};
      if(r.status===200) break;
    }
    return out;
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.locator('main').getByText('QA Bob',{exact:true}).first().click();
  await page.waitForTimeout(2200);
  const card = await page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!d) return {noDialog:true};
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,220),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,25))};
  });
  return {api, cardAfterBlock: card};
};
