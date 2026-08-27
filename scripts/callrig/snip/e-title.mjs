export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const ed=ds.find(d=>/Edit meeting/.test(d.innerText));
    if(!ed) return {noform:true, dialogs:ds.map(d=>d.innerText.slice(0,30))};
    const ins=[...ed.querySelectorAll('input')].filter(vis);
    return {titleValue: ins[0]? ins[0].value : null,
      titleAl: ins[0]? ins[0].getAttribute('aria-label'):null,
      dateTime: ins.slice(1,6).map(i=>({al:i.getAttribute('aria-label'), t:i.type, v:i.value}))};
  });
};
