export default async ({page}) => {
  const btns = await page.evaluate(()=>[...document.querySelectorAll('button')]
    .filter(b=>{const r=b.getBoundingClientRect(); return r.width>0&&r.height>0;})
    .map(b=>({l:(b.getAttribute('aria-label')||'').slice(0,30), t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,18),
              x:Math.round(b.getBoundingClientRect().x)}))
    .filter(o=>/block|profile|call|message|share/i.test(o.l+' '+o.t)));
  const blockBtn = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>{const r=x.getBoundingClientRect();
      return r.width>0&&r.height>0&&/^block$/i.test((x.innerText||x.getAttribute('aria-label')||'').trim());});
    if(!b) return null; b.click(); return 'clicked Block';});
  await page.waitForTimeout(2500);
  const dlg = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0);
    const d=ds[ds.length-1]; if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,180),
      btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,18))};});
  return {btns, blockBtn, dlg};
};
