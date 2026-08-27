export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const probe = async u => { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let j=null; try{j=JSON.parse(t);}catch{}
      return { url:u.replace(CO,'{co}').replace(W,'{ws}'), status:r.status,
               topKeys: j&&typeof j==='object'?Object.keys(j):null,
               entriesType: j&&j.entries?(Array.isArray(j.entries)?'array['+j.entries.length+']':typeof j.entries):'(absent)',
               sample: t.slice(0,260) }; };
    return { workspace: await probe(`/api/v1/workspaces/${W}/admin/audit-log?limit=3`),
             company:   await probe(`/api/v1/companies/${CO}/admin/audit-log?limit=3`) };
  });
};
