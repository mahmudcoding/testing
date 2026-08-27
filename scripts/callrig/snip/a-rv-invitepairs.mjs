import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const labels=[...d.querySelectorAll('label')].filter(window.__qa.boxVis).filter(l=>/^Q[A-Z] /.test((l.innerText||'').trim()));
    return labels.map(l => {
      // the row is the smallest ancestor holding both this label and a checkbox
      let row=l, cb=null;
      for (let i=0;i<5&&row;i++,row=row.parentElement) { cb=row.querySelector('input[type=checkbox]'); if(cb) break; }
      return { label:(l.innerText||'').replace(/\s+/g,' ').trim(),
               checkbox: cb ? { disabled: cb.disabled, checked: cb.checked } : null };
    });
  });
};
