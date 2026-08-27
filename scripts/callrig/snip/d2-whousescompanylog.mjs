// Which admin screens request the COMPANY audit-log endpoint? Snapshot page
// requests before any in-page fetch of our own.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const routes=['/settings/admin/audit-log','/settings/admin/company','/settings/admin/members',
                '/settings/admin/workspaces','/settings/admin/invites','/settings/roles?scope=company'];
  const out={};
  for(const r of routes){
    const seen=[];
    const on=x=>{try{const u=new URL(x.url()); if(u.pathname.includes('audit-log')) seen.push(u.pathname+u.search+' -> '+x.status());}catch{}};
    page.on('response', on);
    await page.goto('https://airion-cargo.store/w/'+WS+r,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    const snap=seen.slice();          // snapshot BEFORE any evaluate that fetches
    page.off('response', on);
    out[r]=snap;
  }
  // also click Next on the audit page and see which endpoint it pages against
  await page.goto('https://airion-cargo.store/w/'+WS+'/settings/admin/audit-log',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const nx=[]; const on2=x=>{try{const u=new URL(x.url()); if(u.pathname.includes('audit-log')) nx.push(u.pathname+u.search+' -> '+x.status());}catch{}};
  page.on('response', on2);
  const b=page.locator('main button').filter({hasText:/^Next$/}).first();
  if(await b.count() && !(await b.isDisabled())) await b.click();
  await page.waitForTimeout(6000);
  page.off('response', on2);
  out['NEXT button'] = nx;
  return out;
};
