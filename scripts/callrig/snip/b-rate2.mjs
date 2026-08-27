export default async ({page}) => {
  const out={};
  const snap = ()=>page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0;
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!d) return {none:true};
    return { rate:(d.innerText.replace(/\s+/g,' ').match(/RATE QUALITY.{0,120}/i)||[])[0]||null,
      stars:[...d.querySelectorAll('button')].filter(vis).filter(b=>/stars?$/.test(b.getAttribute('aria-label')||'')).map(b=>({al:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'), cls:(b.className||'').slice(0,40), disabled:b.disabled})) };
  });
  out.before = await snap();
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='4 stars'); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(2500);
  out.afterClick = await snap();
  // try to change to 2
  out.clicked2 = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='2 stars'); if(b){ if(b.disabled) return 'disabled'; b.click(); return 'clicked';} return 'gone'; });
  await page.waitForTimeout(2500);
  out.afterChange = await snap();
  return out;
};
