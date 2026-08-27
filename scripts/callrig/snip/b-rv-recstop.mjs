export default async ({page}) => {
  const out={};
  out.controls = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>({t:(b.innerText||'').trim().slice(0,30), al:b.getAttribute('aria-label'), tid:b.getAttribute('data-testid')}))
    .filter(b=>/record/i.test((b.t||'')+(b.al||'')+(b.tid||''))));
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/stop recording/i.test((x.getAttribute('aria-label')||'')+' '+(x.innerText||'')));
    if(b){ b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim(); } return null;
  });
  await page.waitForTimeout(2500);
  out.dlg = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0 && x.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return null;
    return {t:d.innerText.replace(/\s+/g,' ').slice(0,250), b:[...d.querySelectorAll('button')].filter(y=>y.getBoundingClientRect().width>0).map(y=>(y.innerText||'').trim()).slice(0,10)};
  });
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(()=>{ const t=document.body.innerText.replace(/\s+/g,' '); return (t.match(/Recording.{0,60}/i)||[])[0]||null; });
  return out;
};
