export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="recording-start-access-trigger"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  out.dlg = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0 && x.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return null;
    return {t:d.innerText.replace(/\s+/g,' ').slice(0,400), b:[...d.querySelectorAll('button')].filter(y=>y.getBoundingClientRect().width>0).map(y=>({t:(y.innerText||'').trim(),tid:y.getAttribute('data-testid')})).slice(0,12)};
  });
  out.started = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0 && x.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return false;
    const b=[...d.querySelectorAll('button')].find(x=>/^Start recording$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return true;} return false;
  });
  await page.waitForTimeout(9000);
  out.mid = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1]||null;
  out.recState = await page.evaluate(async()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    const btn=[...document.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(a=>a&&/record/i.test(a));
    return {rec:(t.match(/Recording.{0,40}/i)||[])[0]||null, recBtns:btn};
  });
  return out;
};
