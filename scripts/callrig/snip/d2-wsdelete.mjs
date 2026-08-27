const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const INTER = `(root) => { const vis=(${VIS});
  return [...root.querySelectorAll('*')].filter(vis).filter(e=>{
    const t=e.tagName.toLowerCase(); const r=e.getAttribute('role')||'';
    return t==='button'||t==='a'||t==='input'||t==='select'||t==='textarea'||['button','link','menuitem','switch','checkbox'].includes(r); })
    .map(e=>({ tag:e.tagName.toLowerCase(), text:(e.innerText||'').trim().replace(/\\n/g,' | ').slice(0,40),
               aria:(e.getAttribute('aria-label')||'').slice(0,40), dis:e.disabled===true })); }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  out.adminWorkspaces = await page.evaluate(`((f)=>{ const fn=${INTER}; const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    return fn(main).filter(x=>!(x.tag==='a'&&false)).filter(x=>x.text!=='' || x.aria!=='').slice(0,20); })()`);
  // open Edit and enumerate everything inside
  const edit = page.locator('button[aria-label^="Edit "]').first();
  out.editFound = await edit.count();
  if (out.editFound) {
    await edit.scrollIntoViewIfNeeded(); await edit.click(); await page.waitForTimeout(2800);
    out.editDialog = await page.evaluate(`(() => { const vis=(${VIS}); const fn=${INTER};
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)
        .sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return (B.width*B.height)-(A.width*A.height);})[0];
      if(!d) return '(no dialog)';
      return { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,300), controls: fn(d).slice(0,14) }; })()`);
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(900);
  }
  // whole-app search for any delete-workspace affordance
  out.deleteSearch = {};
  for (const [name, path] of [['admin/workspaces', `/w/${W}/settings/admin/workspaces`], ['settings/workspace', `/w/${W}/settings/workspace`]]) {
    await page.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    out.deleteSearch[name] = await page.evaluate(`(() => { const vis=(${VIS}); const fn=${INTER};
      const main=document.querySelector('main')||document.body;
      const all=fn(main);
      return { deleteLike: all.filter(x=>/delete|remove|archive|удал/i.test(x.text+' '+x.aria)),
               total: all.length }; })()`);
  }
  return out;
};
