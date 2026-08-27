import { VIS } from './a-nb-lib.mjs';
// Open a participant's action menu and click one item, in a single drive.
// Retries the whole open+detect cycle, because the popper intermittently fails to mount.
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const item = process.env.QA_ITEM || '^Ban$';
  const out = {who, item, attempts: [], net: []};
  page.on('response', async (r) => {
    if (r.request().method() === 'GET') return;
    if (!/\/api\/v1\//.test(r.url())) return;
    let b=null; try{ b=(await r.text()).slice(0,240);}catch(e){ b='<no body>'; }
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''),
                  req:(r.request().postData()||'').slice(0,200), body:b});
  });
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2000); }

  const openTrigger = async () => await page.evaluate(([name, v]) => {
    const vis = eval(v);
    const panel = document.querySelector('[data-testid="call-side-panel-slot"]');
    if (!panel) return {err:'no panel'};
    const cands = [...panel.querySelectorAll('*')].filter(vis)
      .filter(e => (e.innerText||'').includes(name))
      .filter(e => [...e.querySelectorAll('button')].some(b => /Participant actions/i.test(b.getAttribute('aria-label')||'')))
      .sort((a,b) => (a.innerText||'').length - (b.innerText||'').length);
    if (!cands[0]) return {err:'no row for '+name};
    const btn = [...cands[0].querySelectorAll('button')].filter(vis).find(b => /Participant actions/i.test(b.getAttribute('aria-label')||''));
    btn.click();
    return {ok:true, rowTxt:(cands[0].innerText||'').replace(/\s+/g,' ').slice(0,60)};
  }, [who, VIS]);

  const findMenu = async () => await page.evaluate(async (v) => {
    const vis = eval(v); const t0 = Date.now();
    while (Date.now()-t0 < 6000) {
      const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="listbox"],[role="dialog"],[role="alertdialog"]')]
        .filter(vis)
        .filter(m => m.getAttribute('data-testid') !== 'call-overlay-expanded')
        .filter(m => { const n=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length; return n>0 && n<=14; });
      if (ms.length) return {ok:true, ms: Date.now()-t0,
        items:[...ms[ms.length-1].querySelectorAll('[role="menuitem"],button')].filter(vis)
          .map(i=>(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' '))};
      await new Promise(r=>setTimeout(r,250));
    }
    return {err:'no menu'};
  }, VIS);

  let menu = null;
  for (let a = 0; a < 3; a++) {
    const o = await openTrigger();
    if (o.err) { out.attempts.push(o); await page.waitForTimeout(1200); continue; }
    out.open = o;
    const m = await findMenu();
    out.attempts.push({attempt:a, ...(m.err ? {err:m.err} : {foundMs:m.ms, n:m.items.length})});
    if (m.ok) { menu = m; break; }
    // close whatever state we are in and try again
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(1500);
  }
  if (!menu) { out.err = 'menu never opened'; return out; }
  out.items = menu.items;

  out.click = await page.evaluate(([v, re]) => {
    const vis = eval(v); const rx = new RegExp(re, 'i');
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="listbox"],[role="dialog"],[role="alertdialog"]')]
      .filter(vis)
      .filter(m => m.getAttribute('data-testid') !== 'call-overlay-expanded')
      .filter(m => { const n=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length; return n>0 && n<=14; });
    const m = ms[ms.length-1];
    if (!m) return {err:'menu vanished'};
    const items=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis);
    const b=items.find(i => rx.test((i.getAttribute('aria-label')||i.innerText||'').trim()));
    if (!b) return {err:'no item', have: items.map(i=>(i.getAttribute('aria-label')||i.innerText||'').trim())};
    const label=(b.getAttribute('aria-label')||b.innerText||'').trim();
    b.click(); return {ok:true, label};
  }, [VIS, item]);
  await page.waitForTimeout(6000);
  out.hostNotes = await page.evaluate((v)=>{ const vis=eval(v);
    return [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis)
      .map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,140)).filter(Boolean); }, VIS);
  out.after = await page.evaluate((v) => {
    const vis = eval(v);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(x=>[...x.querySelectorAll('button')].filter(vis).length<=8).pop();
    return d ? {dlg:(d.innerText||'').replace(/\s+/g,' ').slice(0,260),
        btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,32), t:b.getAttribute('data-testid')}))} : {dlg:null};
  }, VIS);
  return out;
}
