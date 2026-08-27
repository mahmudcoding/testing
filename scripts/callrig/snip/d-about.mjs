export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/about`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main');
    const links=[]; m.querySelectorAll('a').forEach(a=>{const r=a.getBoundingClientRect(); if(r.width>0&&r.height>0) links.push({t:(a.innerText||'').trim().slice(0,26), href:(a.getAttribute('href')||'').slice(0,50)});});
    const sw=[]; m.querySelectorAll('[role="switch"]').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0){const d=x.getAttribute('aria-describedby'); const de=d?document.getElementById(d):null; sw.push({checked:x.getAttribute('aria-checked'), name:x.getAttribute('aria-label')||(de?.innerText||'').replace(/\s+/g,' ').slice(0,50)||'(no accessible name)'});}});
    return {text:(m.innerText||'').replace(/\s+/g,' ').slice(140,700), links, switches:sw};
  });
};
