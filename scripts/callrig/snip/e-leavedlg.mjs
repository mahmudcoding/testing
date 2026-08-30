/* Open a leave/end dialog and READ it without confirming. QA_TESTID picks which. */
import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={}; const tid = process.env.QA_TESTID || 'call-controls-leave';
  await page.evaluate(DOM);
  out.open = await safeClick(page, `[data-testid="${tid}"]`).catch(e=>String(e));
  await page.waitForTimeout(2000);
  await page.evaluate(DOM);
  out.dialogs = await page.evaluate(()=>{
    const q=window.__qa;
    return [...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(q.boxVis)
      .filter(d=>[...d.querySelectorAll('button')].length<=8)
      .map(d=>({text:(d.innerText||'').replace(/\s+/g,' ').slice(0,600),
        testid:d.getAttribute('data-testid'),
        btns:[...d.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,60),t:n.getAttribute('data-testid'),
          dis:n.disabled===true||n.getAttribute('aria-disabled')==='true'}))}));
  });
  out.stillInCall = /\/call\//.test(page.url());
  if (process.env.QA_ESC) { await page.keyboard.press('Escape'); await page.waitForTimeout(1200); out.afterEsc = page.url(); }
  return out;
};
