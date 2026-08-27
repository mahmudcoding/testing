export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const TEXT=process.env.D2_TEXT||'';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async (TEXT) => {
    const r=await fetch('/api/v1/users/me/status',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({text:TEXT, expires_at:null})});
    const t=await r.text();
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { put:r.status, body:t.slice(0,110), statusNow:(me.custom_status||{}).text||null };
  }, TEXT);
};
