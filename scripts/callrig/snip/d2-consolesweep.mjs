const ROUTES=['settings/account','settings/profile','settings/privacy','settings/notifications',
  'settings/appearance','settings/sessions','settings/security','settings/company','settings/workspace',
  'settings/roles?scope=company','settings/roles?scope=workspace','settings/admin/company',
  'settings/admin/members','settings/admin/invites','settings/admin/workspaces','settings/admin/audit-log',
  'settings/about','settings/calls'];
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={}; let cur=[];
  page.on('console', m => { if(/error|warning/i.test(m.type())) cur.push(m.type()+': '+m.text().replace(/\s+/g,' ').slice(0,110)); });
  page.on('pageerror', e => cur.push('pageerror: '+String(e).replace(/\s+/g,' ').slice(0,110)));
  let total=0;
  for (const route of ROUTES) {
    cur=[];
    await page.goto(`https://airion-cargo.store/w/${W}/${route}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    // prove the listener is alive on this page
    await page.evaluate(`console.error('D2-CONSOLE-CANARY')`);
    await page.waitForTimeout(300);
    const canary = cur.some(x=>/D2-CONSOLE-CANARY/.test(x));
    const real = cur.filter(x=>!/D2-CONSOLE-CANARY/.test(x));
    total += real.length;
    out[route] = { listenerAlive: canary, problems: real.slice(0,3), count: real.length };
  }
  out._total = total;
  return out;
};
