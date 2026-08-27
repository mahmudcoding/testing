export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); if(b) b.click(); });
  await page.waitForTimeout(3500);
  out.dlg = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog],aside')].filter(x=>vis(x)&&x.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,700),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,28),al:b.getAttribute('aria-label'),tid:b.getAttribute('data-testid'),checked:b.getAttribute('aria-checked')})).slice(0,25),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({t:i.type,ph:i.placeholder,tid:i.getAttribute('data-testid'),v:String(i.value).slice(0,20)}))};
  });
  return out;
};
