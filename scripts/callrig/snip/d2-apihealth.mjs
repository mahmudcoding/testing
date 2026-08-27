const ROUTES=['settings/account','settings/profile','settings/privacy','settings/notifications',
  'settings/appearance','settings/sessions','settings/security','settings/company','settings/workspace',
  'settings/roles?scope=company','settings/roles?scope=workspace','settings/admin/company',
  'settings/admin/members','settings/admin/invites','settings/admin/workspaces','settings/admin/audit-log',
  'settings/about','settings/calls'];
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={}; let cur=[];
  page.on('response', r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(!/\/api\//.test(u) || /\/api\/rum/.test(u)) return;
    cur.push({ m:r.request().method(), u:u.slice(0,64), s:r.status() }); });
  for (const route of ROUTES) {
    cur=[];
    await page.goto(`https://airion-cargo.store/w/${W}/${route}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    const bad=cur.filter(x=>x.s>=400);
    out[route]={ requests:cur.length, nonOk: bad.map(x=>`${x.m} ${x.u} -> ${x.s}`) };
  }
  return out;
};
