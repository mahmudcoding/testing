export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const probe = async (m,u) => { const r=await fetch(u,{method:m,credentials:'include'});
      const t=await r.text(); return `${m} ${u.replace(CO,'{co}').replace(W,'{ws}')} -> ${r.status} ${t.slice(0,70)}`; };
    return [
      await probe('DELETE', `/api/v1/companies/${CO}/avatar`),
      await probe('DELETE', `/api/v1/workspaces/${W}/avatar`),
      await probe('DELETE', `/api/v1/companies/avatar`),
      await probe('DELETE', `/api/v1/workspaces/avatar`),
    ];
  });
};
