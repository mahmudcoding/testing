export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,b:t.slice(0,200),j};};
    const post = await call('POST','/api/v1/workspaces/invites',{workspace_id:W, role_ids:[], max_uses:1});
    let cleanup=null;
    if (post.j && post.j.id) cleanup = await call('DELETE', `/api/v1/workspaces/invites/${post.j.id}`);
    return { post:{s:post.s,b:post.b}, cleanup:cleanup&&{s:cleanup.s,b:cleanup.b.slice(0,80)} };
  });
};
