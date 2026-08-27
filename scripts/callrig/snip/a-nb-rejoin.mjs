import { VIS, WS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const CALL = process.env.QA_CALL;
  const out = {};
  // capture the join API response
  await page.evaluate(() => { window.__joinLog = []; });
  page.on('response', async (r) => {});
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.before = await page.evaluate((v) => {
    const vis = eval(v);
    const d = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    return { path: location.pathname,
      dlg: d ? (d.innerText||'').replace(/\s+/g,' ').slice(0,400) : null,
      btns: [...(d||document.querySelector('main')||document.body).querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,34)).filter(Boolean).slice(0,20) };
  }, VIS);
  const j = page.locator('button', {hasText:/^Join$/}).first();
  out.joinBtn = await j.count();
  if (out.joinBtn) { await j.click(); await page.waitForTimeout(7000); }
  out.after = await page.evaluate((v) => {
    const vis = eval(v);
    const d = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    const notes = [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"],[class*="banner"]')].filter(vis)
      .map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,200)).filter(Boolean);
    return { path: location.pathname,
      dlg: d ? (d.innerText||'').replace(/\s+/g,' ').slice(0,500) : null,
      notes,
      btns: [...(d||document.querySelector('main')||document.body).querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,34)).filter(Boolean).slice(0,20) };
  }, VIS);
  return out;
}
