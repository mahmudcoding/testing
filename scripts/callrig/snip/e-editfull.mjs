export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const ed=ds.find(d=>/Edit meeting/.test(d.innerText));
    if(!ed) return {noform:true};
    const ins=[...ed.querySelectorAll('input,textarea')].filter(vis);
    return {full: ed.innerText.replace(/\n{2,}/g,' | ').slice(0,600),
      allInputs: ins.map(i=>({al:i.getAttribute('aria-label'), ph:i.placeholder, t:i.type, v:(i.value||'').slice(0,22)})),
      hiddenTimeInputs: [...ed.querySelectorAll('input[type=time],input[type=date]')].length};
  });
};
