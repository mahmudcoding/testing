export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (WS) => {
    const r=await fetch('/api/v1/workspaces/invites',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({workspace_id:WS, max_uses:5, role_ids:[]})});
    return {s:r.status, t:(await r.text()).slice(0,400)};
  }, WS);
};
