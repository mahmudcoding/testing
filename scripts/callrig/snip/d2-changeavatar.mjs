const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const save = page.locator('button:has-text("Save changes")').first();
  if (await save.count()) { await save.click().catch(()=>{}); await page.waitForTimeout(7000); }
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(3000);
  const out={};
  out.avatarNow = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    return u.avatar_url ?? '(absent)'; });
  // click "Change avatar" and see whether a MENU appears or the file picker opens directly
  const btn = page.locator('button:has-text("Change avatar")').first();
  out.found = await btn.count();
  if (out.found) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(2200);
    out.afterClick = await page.evaluate(`(() => { const vis=(${VIS});
      const menus=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vis);
      return { openSurfaces: menus.length,
        text: menus.length ? (menus[0].innerText||'').replace(/\\n+/g,' | ').slice(0,200) : '(none opened)',
        items: menus.length ? [...menus[0].querySelectorAll('button,[role=menuitem]')].filter(vis)
          .map(e=>(e.innerText||'').trim().slice(0,24)).filter(Boolean) : [] }; })()`); }
  // exhaustive: every interactive node in the profile block
  out.profileBlockControls = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||''); const i=t.indexOf('PROFILE');
    const all=[...main.querySelectorAll('*')].filter(vis).filter(e=>{
      const tg=e.tagName.toLowerCase(); const r=e.getAttribute('role')||'';
      return tg==='button'||tg==='a'||tg==='input'||['button','link','menuitem'].includes(r)||getComputedStyle(e).cursor==='pointer'; })
      .slice(0,14).map(e=>({ tag:e.tagName.toLowerCase(),
        t:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('type')||'').trim().slice(0,26) }));
    return all; })()`);
  return out;
};
