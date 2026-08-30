import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  await safeClick(page,'[data-testid="call-controls-add-to-call"]').catch(e=>out.e1=String(e).slice(0,80));
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(()=>{
    const q=window.__qa;
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(q.boxVis).filter(d=>[...d.querySelectorAll('button')].length<=16);
    const d=ds.pop(); if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,700),
      btns:[...d.querySelectorAll('button,a')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,45),t:n.getAttribute('data-testid')})),
      inputs:[...d.querySelectorAll('input')].map(n=>({v:(n.value||'').slice(0,140),ro:n.readOnly}))};
  });
  return out;
};
