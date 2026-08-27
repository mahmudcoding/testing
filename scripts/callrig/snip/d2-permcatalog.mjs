export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const g = async u => { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let j=null; try{j=JSON.parse(t);}catch{}
      const arr = Array.isArray(j)?j:(j&&(j.permissions||j.items||j.available))||null;
      return { status:r.status, count: arr?arr.length:null,
               items: arr?arr.map(x=>x.action||x.key||JSON.stringify(x).slice(0,40)):null,
               raw: arr?null:t.slice(0,160) }; };
    return { company: await g(`/api/v1/companies/${CO}/permissions/available`),
             workspace: await g(`/api/v1/workspaces/${W}/permissions/available`) };
  });
};
