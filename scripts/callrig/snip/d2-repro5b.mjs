export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (WS) => {
    const r=await fetch(`/api/v1/workspaces/${WS}/presence`,{credentials:'include'});
    const p=await r.json();
    const arr=p.presence||p.users||p.data||[];
    const alice=(Array.isArray(arr)?arr:Object.entries(arr).map(([k,v])=>({user_id:k,...v})))
      .find(x=>String(x.user_id||x.id||'').startsWith('U4QDALICE'));
    return { status:r.status, aliceEntry: alice||null, sample: JSON.stringify(arr).slice(0,220) };
  }, WS);
};
