import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(600);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
    if(!ov) return {err:'no overlay'};
    const seen=new Set(); const out=[];
    for (const e of ov.querySelectorAll('button,[role="switch"],[role="tab"],input,select,[role="slider"],a')) {
      if(!vis(e)) continue;
      const l=(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||e.type||'').trim().replace(/\s+/g,' ').slice(0,34);
      const k=(e.getAttribute('data-testid')||'')+'|'+l;
      if(seen.has(k)) continue; seen.add(k);
      out.push({t:e.getAttribute('data-testid'), l});
    }
    return {n:out.length, ctl:out}; }, VIS);
};
