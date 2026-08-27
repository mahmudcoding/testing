export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const fails=[], errs=[];
  page.on('response', r=>{ if(r.url().includes('/api/v1/')&&r.status()>=400) fails.push(r.status()+' '+r.request().method()+' '+r.url().replace('https://airion-cargo.store','').slice(0,70)); });
  page.on('console', m=>{ if(m.type()==='error') errs.push((m.text()||'').slice(0,120)); });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/profile`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const dom = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const ins=[]; m.querySelectorAll('input,textarea,select').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) ins.push({lab:(x.getAttribute('aria-label')||x.getAttribute('name')||x.placeholder||'?').slice(0,26), val:(x.value||'').slice(0,26), max:x.getAttribute('maxlength')||'', dis:x.disabled});});
    const btns=[]; m.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) btns.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,28), dis:x.disabled});});
    return {text:(m.innerText||'').replace(/\s+/g,' ').slice(150,900), ins, btns};
  });
  return {dom, fails, errs:errs.slice(0,3)};
};
