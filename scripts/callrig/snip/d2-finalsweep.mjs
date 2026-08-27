export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  const bad=[], errs=[], seen=new Set();
  const onResp=r=>{const u=r.url(); if(!u.includes('/api/v1/'))return;
    const k=r.request().method()+' '+r.status()+' '+u.split('/api/v1/')[1].split('?')[0];
    if(r.status()>=400 && !seen.has(k)){seen.add(k); bad.push(k);}};
  const onErr=m=>{ if(m.type()==='error') errs.push((m.text()||'').slice(0,90)); };
  page.on('response',onResp); page.on('console',onErr);
  const routes=['account','profile','notifications','appearance','calls','privacy','sessions',
    'security','about','company','workspace','roles?scope=company','roles?scope=workspace',
    'admin/company','admin/members','admin/invites','admin/workspaces','admin/audit-log'];
  let visited=0;
  for (const r of routes) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${r}`, {waitUntil:'domcontentloaded'}).catch(()=>{});
    await page.waitForTimeout(1600); visited++;
  }
  page.off('response',onResp); page.off('console',onErr);
  return { routesVisited: visited, non2xx: bad, consoleErrors: [...new Set(errs)].slice(0,5) };
};
