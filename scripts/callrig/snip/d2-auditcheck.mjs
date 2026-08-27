const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const nav=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim());
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const i=t.lastIndexOf('›');
    const body=(i>=0?t.slice(i+1):t).trim();
    const ctl=[...main.querySelectorAll('button,input,select,[role=combobox]')].filter(vis)
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
      .filter(e=>e.getBoundingClientRect().left>300).length;
    return { auditInNav: nav.includes('Audit log'), rolesInNav: nav.includes('Roles'),
             denied:/do not have permission|Admin access required|not allowed/i.test(body),
             controls:ctl, chars:body.length, head:body.slice(0,110) }; })()`);
  const api = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch(`/api/v1/workspaces/${W}/admin/audit-log?limit=3`,{credentials:'include'});
    const t=await r.text();
    return { status:r.status, body:t.slice(0,140) };
  });
  return { ui, api };
};
