import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const out = {net: []};
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/.*(invite|meeting)/i.test(u)) return;
    let body = null;
    try { body = (await r.text()).slice(0, 400); } catch(e) { body = '<unreadable>'; }
    let req = null;
    try { req = (r.request().postData()||'').slice(0,300); } catch(e) {}
    out.net.push({m: r.request().method(), s: r.status(), u: u.replace(/^https:\/\/[^/]+/,''), req, body});
  });
  // tick the checkbox for `who`
  out.tick = await page.evaluate(([name, v]) => {
    const vis = eval(v);
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if (!d) return {err:'no dialog'};
    const inp = [...d.querySelectorAll('input')].filter(vis).find(i => (i.getAttribute('aria-label')||'') === name);
    if (!inp) return {err:'no input for '+name};
    inp.click();
    return {ok:true, checked: inp.checked, type: inp.type};
  }, [who, VIS]);
  await page.waitForTimeout(1200);
  out.btn = await page.evaluate((v) => {
    const vis = eval(v);
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const b = [...d.querySelectorAll('button')].filter(vis).find(x => /^Invite \(/.test((x.innerText||'').trim()));
    return b ? {label:(b.innerText||'').trim(), disabled:b.disabled} : {err:'no invite btn'};
  }, VIS);
  if (out.btn.err || out.btn.disabled) return out;
  await page.evaluate((v) => {
    const vis = eval(v);
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    [...d.querySelectorAll('button')].filter(vis).find(x => /^Invite \(/.test((x.innerText||'').trim())).click();
  }, VIS);
  await page.waitForTimeout(6000);
  out.after = await page.evaluate((v) => {
    const vis = eval(v);
    const notes = [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis)
      .map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,200)).filter(Boolean);
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return {notes, dlg: d ? (d.innerText||'').replace(/\s+/g,' ').slice(0,260) : null};
  }, VIS);
  return out;
}
