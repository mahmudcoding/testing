export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const uid = (me.user||me).id;
    const keys = [];
    for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); const v=localStorage.getItem(k)||'';
      const others = (v.match(/U4Q[A-Z0-9]{12}/g)||[]).concat((k.match(/U4Q[A-Z0-9]{12}/g)||[]));
      keys.push({ key:k, bytes:v.length, mentionsOtherUsers:[...new Set(others)].filter(x=>x!==uid) }); }
    return { signedInAs: uid, keyCount: keys.length, keys };
  });
};
