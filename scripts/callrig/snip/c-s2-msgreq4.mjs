export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  out.startUrl=page.url();
  const found=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const c=[...document.querySelectorAll('button,a,[role="button"]')].filter(vis)
      .filter(b=>/Message requests/i.test((b.getAttribute('aria-label')||'')+' '+(b.textContent||'')));
    if(!c.length) return null;
    c[0].setAttribute('data-qa-req','1');
    const r=c[0].getBoundingClientRect();
    return {label:(c[0].getAttribute('aria-label')||'').slice(0,30), rect:[Math.round(r.x),Math.round(r.y)]};});
  out.control=found;
  if(!found) return out;
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/')) reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,46)); };
  page.on('request', onReq);
  await page.locator('[data-qa-req="1"]').click();
  const urls=[];
  for(let i=0;i<12;i++){ await page.waitForTimeout(500); urls.push(page.url().replace('https://airion-cargo.store','')); }
  page.off('request', onReq);
  out.urlTrail=[...new Set(urls)];
  out.apiCalls=[...new Set(reqs)].filter(u=>/request|dm|direct/i.test(u)).slice(0,6);
  out.allApi=[...new Set(reqs)].slice(0,10);
  out.final=await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {url:location.pathname+location.search,
      hasReqText:/request/i.test(m?m.innerText:''),
      txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,120)};});
  // is there a dedicated route?
  for (const path of ['/chat/requests','/chat/message-requests','/directories?tab=requests']){
    await page.goto(`https://airion-cargo.store/w/${ws}${path}`);
    await page.waitForTimeout(3500);
    out[path]=await page.evaluate(()=>{
      const m=document.querySelector('main');
      return {url:location.pathname+location.search, txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,90)};});
  }
  return out;
};
