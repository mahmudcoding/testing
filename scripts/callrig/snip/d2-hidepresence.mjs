export default async ({ page }) => {
  const HIDE = (process.env.D2_HIDE || 'false') === 'true';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  return await page.evaluate(`(async () => {
    const body=JSON.stringify({hide_presence: ${HIDE}});
    const out={};
    for (const m of ['PUT','PATCH','POST']) {
      const r=await fetch('/api/v1/users/me/presence-settings/update',{method:m,credentials:'include',
        headers:{'Content-Type':'application/json'},body});
      out[m]={s:r.status,b:(await r.text()).slice(0,90)};
      if (r.status>=200 && r.status<300) break;
    }
    const now=await (await fetch('/api/v1/users/me/presence-settings',{credentials:'include'})).text();
    return { tried:out, presenceSettings:now.slice(0,80) };
  })()`);
};
