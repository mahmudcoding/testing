export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  out.panel = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const cands=[...document.querySelectorAll('aside,[role=dialog],section,div')].filter(x=>vis(x)&&/side room/i.test(x.innerText||''));
    cands.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const d=cands[0];
    if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,500),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,30),al:b.getAttribute('aria-label'),tid:b.getAttribute('data-testid')})).slice(0,20),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({t:i.type,ph:i.placeholder,tid:i.getAttribute('data-testid')}))};
  });
  return out;
};
