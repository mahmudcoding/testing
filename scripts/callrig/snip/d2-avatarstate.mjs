const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).length;
    const imgs=[...main.querySelectorAll('img')].filter(vis).map(i=>({
      src:(i.getAttribute('src')||'').slice(0,90), w:Math.round(i.getBoundingClientRect().width) }));
    const saveBar=[...main.querySelectorAll('button')].filter(vis)
      .map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t));
    const t=(main.innerText||''); const i=t.lastIndexOf('\\u203a');
    return { openDialogs:dlg, images:imgs, saveBarButtons:saveBar,
             unsavedHint:(t.match(/\\d+ unsaved change/)||[''])[0],
             content:(i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim().slice(0,220) }; })()`);
};
