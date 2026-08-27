import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => await page.evaluate((v)=>{ const vis=eval(v);
  const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
    .filter(d=>/Invite to this call/i.test(d.innerText||''));
  const d=ds.pop(); if(!d) return {err:'no invite dialog'};
  return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,320),
    rows:[...d.querySelectorAll('label,li,[role="option"]')].filter(vis)
      .map(x=>(x.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)).filter(Boolean).slice(0,12)}; }, VIS);
