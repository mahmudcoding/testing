export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}`);
  await page.waitForTimeout(7000);
  out.sidebar=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return {dms:[...document.querySelectorAll('a[href*="/d/"]')].filter(vis)
        .map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,26)),
      reqBtn:[...document.querySelectorAll('button,a')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim())
        .filter(t=>/Message requests/i.test(t))};});
  const req=page.locator('button, a').filter({hasText:'Message requests'}).first();
  out.reqFound=await req.count();
  if(out.reqFound){ await req.click(); await page.waitForTimeout(4000);
    out.reqScreen=await page.evaluate(()=>{
      const m=document.querySelector('main');
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      return {txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,240),
        url:location.pathname,
        btns:[...document.querySelectorAll('main button')].filter(vis)
          .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20)).slice(0,14)};});
  }
  out.notifs=await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=5',{credentials:'include'})).json();
    return (j.notifications||j.data||j||[]).slice(0,3)
      .map(n=>({type:n.type,title:n.title,body:(n.body||'').slice(0,32)}));});
  return out;
};
