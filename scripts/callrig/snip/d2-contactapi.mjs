export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const A = 'U4QDALICE000001', W = 'W4QDF1XTURESO01';
    const urls = [
      `/api/v1/users/${A}`, `/api/v1/users/${A}/profile`, `/api/v1/users/${A}/settings`,
      `/api/v1/users/${A}/status`, `/api/v1/workspaces/${W}/members?limit=50`,
      `/api/v1/auth/me`, `/api/v1/auth/me/settings`
    ];
    const out = [];
    for (const u of urls) {
      try {
        const r = await fetch(u, { credentials: 'include' });
        const t = await r.text();
        const hit = /998 90 123|qa-probe|example\.org/.test(t);
        const hasKey = /"contacts"|"phone"|"linkedin"|"github"|"website"/.test(t);
        out.push({ u: u.replace(/\?.*/, ''), s: r.status, len: t.length, valuesPresent: hit, contactKeysPresent: hasKey,
                   sample: hasKey ? (t.match(/.{0,60}"contacts".{0,140}/) || [''])[0] : '' });
      } catch (e) { out.push({ u, err: String(e).slice(0, 60) }); }
    }
    return out;
  });
};
