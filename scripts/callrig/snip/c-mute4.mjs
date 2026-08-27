export default async ({page}) => {
  const ws='W4QCF1XTURESO01', id='C4QCGENERAL0001';
  const btn = () => page.evaluate(()=>{const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed')}:null;});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const reqs=[]; page.on('response', r=>{if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET') reqs.push(r.request().method()+' '+r.url().replace(/^https?:\/\/[^/]+/,'')+' → '+r.status());});
  await page.locator('button[aria-label="Mute notifications"]').first().click();
  await page.waitForTimeout(1200);
  const items = await page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const m=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(vis)[0];
    if(!m) return {none:true};
    return {items:[...m.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vis(e))
      .map(e=>({tag:e.tagName, role:e.getAttribute('role')||(e.closest('[role]')||{}).getAttribute?.('role'), t:e.textContent.trim().slice(0,30)}))};
  });
  const target = page.getByText('Until turned off', {exact:true}).last();
  await target.click();
  await page.waitForTimeout(2500);
  const afterPick = await btn();
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
  await page.waitForTimeout(4200);
  return {menuItems: items, afterPick, afterReload: await btn(), apiWrites: reqs};
};
