export default async ({ page }) => {
  const CO='O4QDF1XTURESO01';
  return await page.evaluate(async (CO) => {
    const m=await (await fetch(`/api/v1/companies/${CO}/members?limit=50`,{credentials:'include'})).json();
    const arr=m?.members||m?.data||[];
    return arr.map(u=>({ who:(u.email||u.user?.email||u.username||'?').replace(/@.*/,''),
      roles:(u.roles||[]).map(r=>r.name||r) }));
  }, CO);
};
