// Create an invite link with max_uses = 1 and return its token.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(async (WS)=>{
    const r=await fetch('/api/v1/workspaces/invites',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({workspace_id:WS, max_uses:1})});
    const t=await r.text();
    return {status:r.status, body:t.slice(0,300)};
  }, WS);
};
