import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => await page.evaluate((v)=>{ const vis=eval(v);
  const roots=[...document.querySelectorAll('[role="dialog"],aside,[data-testid*="panel"],[data-testid*="details"],[data-testid*="member"]')].filter(vis);
  return {n:roots.length, roots:roots.map(r=>({tid:r.getAttribute('data-testid'), tag:r.tagName.toLowerCase(),
    txt:(r.innerText||'').replace(/\s+/g,' ').slice(0,220)})).slice(0,6),
    remove:[...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim())
      .filter(x=>/remove|Remove|удал/i.test(x)).slice(0,12)};}, VIS);
