export default async ({ page }) => {
  const PWS='W4OWMGU872O1OZJ', CWS='W4QDF1XTURESO01';
  return await page.evaluate(async ({PWS,CWS}) => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let o=null; try{o=JSON.parse(t);}catch{}
      return {s:r.status, raw:t.slice(0,240), company_id:(o?.workspace||o)?.company_id ?? '(absent)'};};
    return { personal: await g(`/api/v1/workspaces/${PWS}`),
             company:  await g(`/api/v1/workspaces/${CWS}`) };
  }, {PWS,CWS});
};
