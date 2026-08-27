const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const hrefs = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main a')].filter(vis)
      .filter(a=>/^(Open|Edit) /.test((a.innerText||'').trim()))
      .map(a=>({ text:(a.innerText||'').trim().slice(0,30), href:a.getAttribute('href') })); })()`);
  const editHref = (hrefs.find(h=>/^Edit /.test(h.text))||{}).href;
  let target=null;
  if (editHref) {
    await page.goto('https://airion-cargo.store'+editHref, { waitUntil:'networkidle' });
    await page.waitForTimeout(3000);
    target = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
      const items=[...main.querySelectorAll('button,a,input,select,textarea,[role=switch]')].filter(vis)
        .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
        .map(e=>({ tag:e.tagName.toLowerCase(),
          label:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').trim().replace(/\\s+/g,' ').slice(0,44),
          dis:e.disabled===true }));
      const t=(main.innerText||''); const i=t.lastIndexOf('›');
      return { path: location.pathname, content:(i>=0?t.slice(i+1):t).replace(/\\n+/g,' | ').trim().slice(0,320),
               controls: items, deleteLike: items.filter(x=>/delete|remove|archive/i.test(x.label)) }; })()`);
  }
  return { linksOnAdminWorkspaces: hrefs, editTarget: target };
};
