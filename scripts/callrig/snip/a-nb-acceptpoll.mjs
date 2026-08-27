import { VIS, WS } from './a-nb-lib.mjs';
// Sit on a neutral page, watch for an incoming-call/invite prompt, click Accept, keep watching.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 40000);
  if (process.env.QA_GOTO) { await page.goto(`https://airion-cargo.store/w/${WS}/${process.env.QA_GOTO}`, {waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000); }
  const net = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/.*(meeting|join)/i.test(u)) return;
    if (r.request().method() === 'GET' && r.status() === 200) return;
    let body=null; try { body=(await r.text()).slice(0,300); } catch(e){ body='<unreadable>'; }
    net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,200), body});
  });
  const res = await page.evaluate(async ([v, ms]) => {
    const vis = eval(v);
    const seen = [], t0 = Date.now(); let accepted = false, last = '';
    const grab = () => {
      const dlgs = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis);
      const notes = [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"],[class*="banner"],[class*="Banner"],[class*="incoming"],[class*="Incoming"]')]
        .filter(vis).map(n=>{const r=n.getBoundingClientRect();
          return {txt:(n.innerText||'').replace(/\s+/g,' ').slice(0,220), w:Math.round(r.width), h:Math.round(r.height)};})
        .filter(n=>n.txt && n.w>8 && n.h>8);
      return {p:location.pathname, dlg:dlgs.map(d=>({txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
        btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30)).filter(Boolean)})), notes};
    };
    while (Date.now() - t0 < ms) {
      const s = grab(); const k = JSON.stringify(s);
      if (k !== last) { seen.push({ms:Date.now()-t0, acceptedYet:accepted, ...s}); last = k; }
      if (!accepted) {
        const btn = [...document.querySelectorAll('button')].filter(vis)
          .find(b => /^(Accept|Join)$/i.test((b.getAttribute('aria-label')||b.innerText||'').trim()));
        if (btn) { btn.click(); accepted = true; seen.push({ms:Date.now()-t0, clicked:(btn.getAttribute('aria-label')||btn.innerText||'').trim()}); }
      }
      await new Promise(r=>setTimeout(r,300));
    }
    return seen;
  }, [VIS, MS]);
  return {states: res, net};
}
