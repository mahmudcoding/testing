export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(()=>{
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const btns=[]; m.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0){
      const d=x.getAttribute('aria-describedby'); const de=d?document.getElementById(d):null;
      btns.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,36), dis:!!x.disabled, desc:(de?.innerText||'').replace(/\s+/g,' ').slice(0,140)});
    }});
    return {text:t.slice(150,1500), btns};
  });
};
