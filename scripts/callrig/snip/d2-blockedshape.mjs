export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const out={};
    const raw0 = await (await fetch('/api/v1/messaging/users/blocked?limit=50',{credentials:'include'})).text();
    out.emptyState = { len: raw0.length, body: raw0.slice(0,200) };
    const b = await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:'U4QDBOB00000001'})});
    out.blocked = b.status;
    await new Promise(r=>setTimeout(r,1500));
    const raw1 = await (await fetch('/api/v1/messaging/users/blocked?limit=50',{credentials:'include'})).text();
    let j=null; try{j=JSON.parse(raw1);}catch{}
    out.afterBlock = { len: raw1.length, topKeys: j && typeof j==='object' && !Array.isArray(j) ? Object.keys(j) : (Array.isArray(j)?'(array)':null),
                       body: raw1.slice(0,240) };
    // clean up
    const u = await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:'U4QDBOB00000001'})});
    out.unblocked = u.status;
    return out;
  });
};
