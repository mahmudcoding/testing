export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-add-to-call"]'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  out.dlg = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0 && x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,600),
      inputs:[...d.querySelectorAll('input,textarea')].map(i=>({t:i.type,v:String(i.value||'').slice(0,120),ph:i.placeholder})),
      btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>({t:(b.innerText||'').trim().slice(0,30), al:b.getAttribute('aria-label'), tid:b.getAttribute('data-testid')})).slice(0,20),
      links:[...d.querySelectorAll('a')].map(a=>a.href).slice(0,5),
      urls:(d.innerText.match(/https?:\/\/\S+/g)||[]).slice(0,3)};
  });
  return out;
};
