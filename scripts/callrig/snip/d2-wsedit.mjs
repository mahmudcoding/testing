const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const before = page.url();
  const btn = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button,a[href]')].filter(vis).filter(x=>/^Edit /.test((x.innerText||'').trim()))[0];
    if(!b) return 'not found';
    return { text:(b.innerText||'').trim().slice(0,26), tag:b.tagName.toLowerCase(),
             href:(b.getAttribute('href')||'').slice(0,50),
             expanded:b.getAttribute('aria-expanded'), haspopup:b.getAttribute('aria-haspopup') }; })()`);
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button,a[href]')].filter(vis).filter(x=>/^Edit /.test((x.innerText||'').trim()))[0];
    if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const main=document.querySelector('main')||document.body;
    return { url: location.pathname, dialogs: dlg.length,
             dialogText: dlg.length? (dlg[0].innerText||'').replace(/\\s+/g,' ').slice(0,200):null,
             pageStart: (main.innerText||'').replace(/\\s+/g,' ').slice(0,160) }; })()`);
  return { button:btn, urlBefore:new URL(before).pathname, after };
};
