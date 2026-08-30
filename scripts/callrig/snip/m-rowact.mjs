import { DOM } from './lib.mjs';
// QA_WHO='QA Alice' QA_ITEM='^Mute QA Alice$'  — open a row menu and click one item.
// QA_CONFIRM='testid' optionally clicks a confirm control afterwards.
export default async ({page, progress}) => {
  await page.evaluate(DOM);
  const who = process.env.QA_WHO || 'QA Alice';
  const item = new RegExp(process.env.QA_ITEM || '^Mute');
  const out = {who, item: String(item)};
  const net = [];
  page.on('response', async r => { const u = r.url();
    if (/\/api\/v1\//.test(u) && r.request().method() !== 'GET') {
      let b=null; try { b = (await r.text()).slice(0,300); } catch(e){}
      net.push({m: r.request().method(), s: r.status(), u: u.replace(/https:\/\/[^/]+/,''), req: (r.request().postData()||'').slice(0,200), res: b}); } });
  // a Radix dropdown left open by an earlier drive survives; clicking the row button
  // would then TOGGLE it closed and the menu read comes back empty.
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const tog = await page.$('[data-testid="call-controls-people-toggle"]');
  if (tog && (await tog.getAttribute('aria-pressed')) !== 'true') { await tog.click(); await page.waitForTimeout(1600); }
  const handle = await page.evaluateHandle((who) => {
    const q = window.__qa; const vis = (e)=>q.vis(e)||q.boxVis(e);
    const T = (e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const acts = [...document.querySelectorAll('button[aria-label="Participant actions"]')].filter(vis);
    for (const a of acts) { let el=a;
      for (let i=0;i<8&&el;i++){ el=el.parentElement; if(!el)break; const t=T(el);
        if (t.includes(who)) return a;
        if (/QA (Owner|Alice|Bob|Carol|Guest|Dave|Admin)/.test(t)) break; } }
    return null; }, who);
  const el = handle.asElement();
  out.rowFound = !!el;
  if (!el) return out;
  const b = await el.boundingBox();
  await page.mouse.click(b.x+b.width/2, b.y+b.height/2);
  await page.waitForTimeout(1600);
  const hit = await page.evaluateHandle((src) => {
    const q = window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const re = new RegExp(src);
    const cands = [...document.querySelectorAll('[role=menu],[data-radix-menu-content],[role=listbox],[data-radix-popper-content-wrapper]')].filter(vis);
    const m = cands[cands.length-1]; if (!m) return null;
    const all = [...m.querySelectorAll('*')].filter(e => vis(e));
    const match = all.filter(e => re.test((e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim()));
    if (!match.length) return null;
    match.sort((x,y)=>(x.textContent||'').length-(y.textContent||'').length);
    return match[0];
  }, process.env.QA_ITEM || '^Mute');
  const iel = hit.asElement();
  out.itemFound = !!iel;
  if (!iel) { out.menuItems = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const c=[...document.querySelectorAll('[role=menu],[data-radix-menu-content],[role=listbox],[data-radix-popper-content-wrapper]')].filter(vis);
    const m=c[c.length-1]; return m?[...new Set([...m.querySelectorAll('*')].filter(e=>vis(e)&&!e.children.length&&e.textContent.trim()).map(e=>e.textContent.trim()))]:null;}); return out; }
  const ib = await iel.boundingBox();
  out.itemLabel = await iel.evaluate(e => (e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,60));
  await page.mouse.click(ib.x+ib.width/2, ib.y+ib.height/2);
  await page.waitForTimeout(1800);
  progress && progress(1);
  // any dialog now?
  out.dialog = await page.evaluate(() => {
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis)
      .filter(d => d.querySelectorAll('button').length <= 10 && d.getAttribute('data-testid') !== 'call-overlay-expanded');
    const d = ds[ds.length-1]; if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,500),
      testid: d.getAttribute('data-testid'),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,50), t:b.getAttribute('data-testid'), d:b.disabled}))};
  });
  if (process.env.QA_CONFIRM) {
    const c = await page.$(`[data-testid="${process.env.QA_CONFIRM}"]`);
    if (c) { const cb = await c.boundingBox(); await page.mouse.click(cb.x+cb.width/2, cb.y+cb.height/2); out.confirmed = true; await page.waitForTimeout(2500); progress && progress(2); }
    else out.confirmed = false;
  }
  out.net = net;
  return out;
};
