export default async ({page}) => {
  const out={};
  const who = process.env.QA_WHO || 'QA Bob';
  const others = (process.env.QA_OTHERS||'QA Carol,QA Dave').split(',');
  out.dlgOpen = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-add-to-call"]'); return b? b.getAttribute('aria-pressed'):null; });
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-add-to-call"]'); if(b) b.click(); });
  await page.waitForTimeout(3500);
  out.rows = await page.evaluate(([w,others])=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const row = n => {
      const c=[...d.querySelectorAll('div,li,label')].filter(e=>vis(e)&&(e.innerText||'').includes(n)&&e.querySelector('input[type=checkbox]'))
        .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
      return c? {text:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,70), cbDisabled:c.querySelector('input[type=checkbox]').disabled}:null;
    };
    const out={target:row(w), others:{}};
    for(const o of others) out.others[o]=row(o);
    out.dialogText=(d.innerText||'').replace(/\s+/g,' ').slice(0,300);
    return out;
  }, [who, others]);
  return out;
};
