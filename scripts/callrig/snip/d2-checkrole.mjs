export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (WS) => {
    const r=await fetch(`/api/v1/workspaces/${WS}/roles`,{credentials:'include'}); const t=await r.text();
    const probe=(JSON.parse(t).roles||[]).filter(x=>/QA D Probe/.test(x.name));
    return probe.map(p=>({name:p.name,id:p.id,permissions:p.permissions}));
  }, WS);
};
