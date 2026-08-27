export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Close meeting settings'); if(b) b.click(); });
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^(Add to call)$/i.test(x.getAttribute('aria-label')||'')); if(b) b.click(); });
  await page.waitForTimeout(2500);
  out.link = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop()||document.body;
    const i=[...d.querySelectorAll('input')].map(x=>String(x.value)).filter(v=>v.includes('http'));
    return i[0]||null;
  });
  out.panelText = await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop(); return d? d.innerText.replace(/\s+/g,' ').slice(0,300):null; });
  return out;
};
