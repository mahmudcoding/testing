import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(1800); }
  const opened = await page.evaluate(([name, v]) => {
    const vis = eval(v);
    const panel = document.querySelector('[data-testid="call-side-panel-slot"]');
    if (!panel) return {err:'no panel'};
    // smallest visible element whose text contains the name and which holds a Participant actions button
    const cands = [...panel.querySelectorAll('*')].filter(vis)
      .filter(e => (e.innerText||'').includes(name))
      .filter(e => [...e.querySelectorAll('button')].some(b => /Participant actions/i.test(b.getAttribute('aria-label')||'')))
      .sort((a,b) => (a.innerText||'').length - (b.innerText||'').length);
    const row = cands[0];
    if (!row) return {err:'no row for '+name};
    const btn = [...row.querySelectorAll('button')].filter(vis).find(b => /Participant actions/i.test(b.getAttribute('aria-label')||''));
    btn.click();
    return {ok:true, rowTxt:(row.innerText||'').replace(/\s+/g,' ').slice(0,80)};
  }, [who, VIS]);
  if (opened.err) return opened;
  await page.waitForTimeout(1600);
  const menu = await page.evaluate((v) => {
    const vis = eval(v);
    const ms = [...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="listbox"],[role="dialog"]')].filter(vis);
    const m = ms[ms.length-1];
    if (!m) return {err:'no menu open'};
    return { items: [...m.querySelectorAll('[role="menuitem"],button,[role="option"]')].filter(vis)
        .map(i=>({l:(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' ').slice(0,44), d:i.getAttribute('aria-disabled')||i.disabled||null})),
      txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,400) };
  }, VIS);
  return {opened, menu};
}
