import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 45000);
  return await page.evaluate(async ([v, ms])=>{ const vis=eval(v);
    const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const hit=[...document.querySelectorAll('*')].filter(e=>!e.childElementCount)
        .find(e=>/invited you to join/i.test(e.textContent||'') && vis(e));
      let s='none';
      if (hit) { let box=hit;
        for(let i=0;i<5 && box.parentElement;i++){ box=box.parentElement;
          if([...box.querySelectorAll('button')].filter(vis).length) break; }
        const btns=[...box.querySelectorAll('button')].filter(vis)
          .map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()||'?').slice(0,24));
        const r=hit.getBoundingClientRect();
        s=JSON.stringify({txt:(hit.textContent||'').trim().slice(0,60), box:`${Math.round(r.width)}x${Math.round(r.height)}`, btns});
      }
      if(s!==last){ out.push({ms:Date.now()-t0, s}); last=s; }
      await new Promise(x=>setTimeout(x,400)); }
    return out; }, [VIS, MS]);
};
