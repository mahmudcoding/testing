import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const tid = process.env.QA_TID || 'call-controls-chat-toggle';
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  return await page.evaluate(([t,v])=>{ const vis=eval(v);
    const cls = e => String(e.className && e.className.baseVal!==undefined ? e.className.baseVal : (e.className||''));
    const b=document.querySelector('[data-testid="'+t+'"]'); if(!b) return {err:'not found'};
    const par=b.parentElement;
    const dump = e => ({tag:e.tagName.toLowerCase(), tid:e.getAttribute('data-testid'),
      cls:cls(e).slice(0,70), txt:(e.childElementCount===0?(e.textContent||'').trim().slice(0,16):''),
      box:(()=>{const r=e.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height);})()});
    return {button:dump(b), inside:[...b.querySelectorAll('*')].map(dump).slice(0,10),
      siblings: par?[...par.children].map(dump).slice(0,10):[]}; }, [tid, VIS]);
};
