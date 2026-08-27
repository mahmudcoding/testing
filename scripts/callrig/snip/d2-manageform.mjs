const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const FIELDS = `() => { const vis=(${VIS});
  const links=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis);
  const xs=links.map(a=>a.getBoundingClientRect().right).sort((a,b)=>a-b);
  const navRight = xs.length ? xs[Math.floor(xs.length*0.6)] : 0;
  return [...document.querySelectorAll('main input')].filter(vis)
    .filter(e=>e.getBoundingClientRect().left > navRight + 10)
    .map(e=>({ value:String(e.value), placeholder:e.getAttribute('placeholder')||'',
               minlength:e.getAttribute('minlength')||'', maxlength:e.getAttribute('maxlength')||'' })); }`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  out.settingsCompanyPage = await page.evaluate(`(${FIELDS})()`);
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const manage = page.locator('[role=tab]:has-text("Manage"), a:has-text("Manage")').first();
  if (await manage.count()) { await manage.scrollIntoViewIfNeeded(); await manage.click(); await page.waitForTimeout(3500); }
  out.dashboardManageTab = await page.evaluate(`(${FIELDS})()`);
  // is there a save control on the Manage tab, and is it enabled with an empty field?
  out.saveControls = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main button')].filter(vis)
      .map(b=>({ t:(b.innerText||'').trim().slice(0,24), dis:b.disabled===true }))
      .filter(x=>/save|apply|update/i.test(x.t)); })()`);
  out.actualCompanyName = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/users/me/companies',{credentials:'include'})).json();
    const a=j.companies||j.items||(Array.isArray(j)?j:[]); return a.map(c=>c.name); });
  return out;
};
