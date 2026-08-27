import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const tid = process.env.QA_TESTID || '';
  const lbl = process.env.QA_LABEL || 'Ban';
  const r = await page.evaluate(([v, t, l]) => {
    const vis = eval(v);
    const d = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    if (!d) return {err:'no dialog'};
    let b = t ? d.querySelector('[data-testid="'+t+'"]') : null;
    if (!b) b = [...d.querySelectorAll('button')].filter(vis).find(x => new RegExp('^'+l+'$','i').test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if (!b) return {err:'no button', have:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim())};
    b.click(); return {ok:true, label:(b.getAttribute('aria-label')||b.innerText||'').trim()};
  }, [VIS, tid, lbl]);
  await page.waitForTimeout(5000);
  const panel = await page.evaluate((v) => {
    const vis = eval(v);
    const p = document.querySelector('[data-testid="call-side-panel-slot"]');
    return p ? (p.innerText||'').replace(/\s+/g,' ').slice(0,400) : null;
  }, VIS);
  return {r, panel};
}
