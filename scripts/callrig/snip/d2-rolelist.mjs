export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', WS='W4QDF1XTURESO01';
  return await page.evaluate(async ({CO,WS}) => {
    const j = async u => { const r=await fetch(u,{credentials:'include'}); return {s:r.status,t:(await r.text()).slice(0,1600)}; };
    return { co: await j(`/api/v1/companies/${CO}/roles`), ws: await j(`/api/v1/workspaces/${WS}/roles`) };
  }, {CO,WS});
};
