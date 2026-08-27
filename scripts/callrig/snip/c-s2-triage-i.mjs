export default async ({page}) => {
  const ws='W4QCF1XTURESO01', id='M4OX4T1EI6UJRNS';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(10000);
  const banner=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    const b=[...m.querySelectorAll('button,[role="button"]')].filter(v)
      .map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,24)||x.getAttribute('aria-label'))
      .filter(t=>t&&/View all/i.test(t));
    return b[0]||null;});
  out.bannerBefore=await banner();
  const el=page.locator(`main [data-message-id="${id}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  await el.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1500);
  const unpin=page.getByText(/^Unpin message$/).first();
  out.unpinFound=await unpin.count();
  if(!out.unpinFound){ await page.keyboard.press('Escape'); return out; }
  let reqs=[];
  const h=(r)=>{ if(/\/api\/v1/.test(r.url()) && r.method()!=='GET') reqs.push(r.method()+' '+r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,60)); };
  page.on('request',h);
  await unpin.click(); await page.waitForTimeout(4500);
  page.off('request',h);
  out.requests=reqs.slice(0,4);
  out.bannerAfter=await banner();
  await page.reload(); await page.waitForTimeout(9000);
  out.bannerAfterReload=await banner();
  out.menuAfter=await (async()=>{
    const e2=page.locator(`main [data-message-id="${id}"]`).first();
    await e2.scrollIntoViewIfNeeded(); await e2.hover(); await page.waitForTimeout(900);
    const m=e2.locator('button[aria-label="More actions"]').first();
    if(!await m.count()) return 'no menu';
    await m.click(); await page.waitForTimeout(1400);
    const items=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const mm=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      return mm? (mm.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean):[];});
    await page.keyboard.press('Escape');
    return items;})();
  return out;
};
