import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ws = 'W4QAF1XTURESO01';
  await page.evaluate(DOM).catch(()=>{});
  const api = await page.evaluate(async (w) => {
    const r = await fetch(`/api/v1/workspaces/${w}/channels`, { credentials:'include' });
    const t = await r.text();
    let j = {}; try { j = JSON.parse(t); } catch {}
    const list = j.channels || j.data || [];
    return { s: r.status, count: list.length,
             dms: list.filter(c => /dm|direct/i.test(c.type||'') || c.is_dm)
                      .map(c => ({ id:c.id, type:c.type, name:c.name, members:(c.members||[]).length })).slice(0,10),
             types: [...new Set(list.map(c=>c.type))] };
  }, ws);
  // sidebar links, which is how a person gets there
  const links = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('a[href]')].filter(e=>q.vis(e))
      .map(e=>({ href:e.getAttribute('href'), l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40) }))
      .filter(x=>/\/d\//.test(x.href||''));
  });
  return { api, dmLinks: links };
};
