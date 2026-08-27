export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  res.page = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const b=[]; m.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) b.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,34), dis:!!x.disabled, desc:(document.getElementById((x.getAttribute('aria-describedby')||'')) ||{}).innerText||''});});
    return {text:(m.innerText||'').replace(/\s+/g,' ').slice(150,1100), btns:b};
  });
  // what does the tooltip/description say for the disabled destructive buttons?
  res.descriptions = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('main button[aria-describedby]').forEach(b=>{
      const d=document.getElementById(b.getAttribute('aria-describedby'));
      out.push({btn:(b.innerText||'').trim().slice(0,24), dis:!!b.disabled, description:(d?.innerText||'').replace(/\s+/g,' ').slice(0,220)});
    });
    return out;
  });
  return res;
};
