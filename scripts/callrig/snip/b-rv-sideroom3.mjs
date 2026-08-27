export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="side-rooms-new"]'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  out.dlg = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,500),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,30),al:b.getAttribute('aria-label'),tid:b.getAttribute('data-testid'),d:b.disabled})),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({t:i.type,ph:i.placeholder,tid:i.getAttribute('data-testid')}))};
  });
  const nm = await page.$('[data-testid="side-room-create-name"]');
  if (nm) { await nm.fill('QA room'); await page.waitForTimeout(800); }
  // pick the guest as a member if the dialog offers a picker
  out.picked = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const cand=[...d.querySelectorAll('button,li,label,[role=option]')].filter(e=>vis(e)&&/Guest Side/.test(e.innerText||''));
    cand.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    if(cand.length){ cand[0].click(); return (cand[0].innerText||'').replace(/\s+/g,' ').slice(0,60); }
    return null;
  });
  await page.waitForTimeout(1500);
  out.dlg2 = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    return d? {text:d.innerText.replace(/\s+/g,' ').slice(0,500), btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,30),tid:b.getAttribute('data-testid'),d:b.disabled}))}:null;
  });
  return out;
};
