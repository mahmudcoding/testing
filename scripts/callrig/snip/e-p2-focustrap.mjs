import {WS, BASE} from './e-p2-helpers.mjs';
const where = () => {
  const e=document.activeElement;
  if(!e) return null;
  const vis=x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0;};
  const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  return {tag:e.tagName, label:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26),
    insideDialog: !!dlg && dlg.contains(e), dialogOpen: !!dlg,
    ariaModal: dlg? dlg.getAttribute('aria-modal') : null};
};
async function trial(page, sel, name){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator(sel).first().click();
  await page.waitForTimeout(2500);
  const seq=[];
  for(let i=0;i<16;i++){ await page.keyboard.press('Tab'); await page.waitForTimeout(150);
    const s=await page.evaluate(where); if(s) seq.push(s); }
  const escaped=seq.filter(s=>s.dialogOpen && !s.insideDialog);
  await page.keyboard.press('Escape');
  return {name, stops:seq.length, ariaModal:(seq[0]||{}).ariaModal,
    escapedCount:escaped.length, escapedTo:[...new Set(escaped.map(s=>s.label))].slice(0,5),
    lastFew:seq.slice(-3).map(s=>`${s.label}${s.insideDialog?'':'  <-OUTSIDE'}`)};
}
export default async ({page}) => ({
  search:   await trial(page,'[aria-label="Search QA Workspace E"]','global search'),
  archived: await trial(page,'[aria-label="Open archived channels"]','archived panel'),
});
