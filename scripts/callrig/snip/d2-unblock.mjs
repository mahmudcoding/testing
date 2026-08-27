export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const g=async()=>{const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
      const j=await r.json().catch(()=>null); return (j&&j.users)||[];};
    const before=await g();
    const out={ blockedBefore: before.map(u=>u.username) , attempts:[] };
    for (const u of before) {
      const r=await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:u.id})});
      out.attempts.push(`${u.username} -> ${r.status} ${(await r.text()).slice(0,60)}`);
    }
    await new Promise(r=>setTimeout(r,1000));
    out.blockedAfter=(await g()).map(u=>u.username);
    return out;
  });
};
