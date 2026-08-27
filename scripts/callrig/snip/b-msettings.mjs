export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Meeting settings'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  out.panel = await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop()||document.body;
    return {
      text: d.innerText.replace(/\n{2,}/g,'\n').slice(0,1100),
      buttons: [...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,30),
      inputs: [...d.querySelectorAll('input')].filter(vis).map(i=>({t:i.type, v:String(i.value).slice(0,30), ph:i.placeholder, checked:i.checked, lab:i.getAttribute('aria-label')})).slice(0,20),
      tabs: [...d.querySelectorAll('[role=tab]')].filter(vis).map(t=>t.innerText.replace(/\s+/g,' ').trim())
    };
  });
  return out;
};
