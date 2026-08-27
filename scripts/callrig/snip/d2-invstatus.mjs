export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch(`/api/v1/workspaces/${W}/invites`,{credentials:'include'});
    const j=await r.json(); const arr=j.invites||[];
    const c={}; for(const i of arr){ c[i.status]=(c[i.status]||0)+1; }
    const mine=arr.find(i=>i.id==='I4OX3IA6X6KMD6V');
    return { total:arr.length, byStatus:c, mine: mine?{id:mine.id,status:mine.status}:'(gone)' };
  });
};
