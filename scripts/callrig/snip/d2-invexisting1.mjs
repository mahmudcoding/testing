export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch('/api/v1/workspaces/invites',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({workspace_id:W, role_ids:[], max_uses:5})});
    const t=await r.text(); let j=null; try{j=JSON.parse(t)}catch{}
    return { status:r.status, id:j&&j.id, token:j&&j.token, used:j&&j.used_count };
  });
};
