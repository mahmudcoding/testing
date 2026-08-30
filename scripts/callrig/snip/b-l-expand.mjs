import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  const pip = await page.evaluate(()=>!!document.querySelector('[data-testid="draggable-pip"]'));
  if(pip){
    out.click = await page.evaluate(()=>{
      const q=window.__qa;
      const p=document.querySelector('[data-testid="draggable-pip"]');
      const b=[...p.querySelectorAll('button')].find(x=>/^Expand$/i.test(q.nameOf(x).trim()));
      if(!b) return {ok:false}; b.click(); return {ok:true};
    });
    await page.waitForTimeout(3000);
  }
  out.url = page.url();
  out.surface = await page.evaluate(()=>{
    const q=window.__qa;
    const s=document.querySelector('[data-testid="call-surface"]');
    return {present:!!s, vis:s?q.boxVis(s):false,
      tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].length};
  });
  return out;
};
