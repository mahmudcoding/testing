export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const reqs=[];
  page.on('response', r=>{ if(r.url().includes('/api/v1/')) reqs.push({s:r.status(), m:r.request().method(), u:r.url().replace('https://airion-cargo.store','').slice(0,110)}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const auditReqs = reqs.filter(r=>/audit|activity|event|log/i.test(r.u));
  // read current workspace name from the API (ground truth)
  const ws = await page.evaluate(async()=>{
    const r = await fetch('/api/v1/workspaces/W4QDF1XTURESO01',{credentials:'include'});
    const j = await r.json();
    return {status:r.status, name:j.name||j.data?.name, keys:Object.keys(j).slice(0,12)};
  });
  const body = auditReqs.length ? await page.evaluate(async(u)=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();return {s:r.status,b:t.slice(0,400)};}, auditReqs[0].u) : null;
  return {ws, auditReqs, allReqs:reqs.slice(-14), body};
};
