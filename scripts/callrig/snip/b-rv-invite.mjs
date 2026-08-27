export default async ({page}) => {
  const out={};
  const who = process.env.QA_WHO || 'QA Bob';
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-add-to-call"]'); if(b) b.click(); });
  await page.waitForTimeout(3500);
  out.rowsBefore = await page.evaluate((w)=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const cands=[...d.querySelectorAll('div,li,label')].filter(e=>vis(e)&&(e.innerText||'').includes(w)&&e.querySelector('input[type=checkbox]'));
    cands.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const c=cands[0];
    return c? {text:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,80), cbDisabled:c.querySelector('input[type=checkbox]').disabled}:null;
  }, who);
  out.checked = await page.evaluate((w)=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    const cands=[...d.querySelectorAll('div,li,label')].filter(e=>vis(e)&&(e.innerText||'').includes(w)&&e.querySelector('input[type=checkbox]'));
    cands.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const c=cands[0]; if(!c) return null;
    const cb=c.querySelector('input[type=checkbox]'); if(cb.disabled) return 'disabled';
    cb.click(); return cb.checked;
  }, who);
  await page.waitForTimeout(1500);
  out.inviteBtn = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Invite \(/.test((x.innerText||'').trim()));
    if(!b) return null; b.click(); return (b.innerText||'').trim();
  });
  await page.waitForTimeout(4000);
  out.at = new Date().toISOString();
  out.rowsAfter = await page.evaluate((w)=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const cands=[...d.querySelectorAll('div,li,label')].filter(e=>vis(e)&&(e.innerText||'').includes(w)&&e.querySelector('input[type=checkbox]'));
    cands.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const c=cands[0];
    return c? {text:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,80), cbDisabled:c.querySelector('input[type=checkbox]').disabled}:null;
  }, who);
  return out;
};
