import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(x=>x.querySelector('[data-testid="admin-permissions-submit"]')).pop();
    if(!d) return {err:'no admin dialog'};
    return [...d.querySelectorAll('input[type=checkbox]')].filter(vis).map((i,idx)=>{
      const lab = i.closest('label');
      const byId = i.id ? d.querySelector('label[for="'+i.id+'"]') : null;
      const labelled = i.getAttribute('aria-labelledby');
      const byRef = labelled ? document.getElementById(labelled) : null;
      // nearest ancestor whose text is short and unique
      let anc=i.parentElement, best=null;
      while(anc && anc!==d){ const t=(anc.innerText||'').replace(/\s+/g,' ').trim(); if(t && t.length<40){best=t;} anc=anc.parentElement; }
      return {idx, id:i.id||null, checked:i.checked,
        viaLabel: lab?(lab.innerText||'').replace(/\s+/g,' ').trim().slice(0,40):null,
        viaFor: byId?(byId.innerText||'').trim().slice(0,40):null,
        viaLabelledBy: byRef?(byRef.innerText||'').trim().slice(0,40):null,
        nearestText: best};
    }); }, VIS);
}
