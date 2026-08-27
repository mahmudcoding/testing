export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=workspace', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r0 = await fetch(`/api/v1/workspaces/${W}/roles`, { credentials:'include' });
    const j = await r0.json(); const arr = Array.isArray(j)?j:(j.roles||[]);
    const t = arr.find(x=>/^D2 reverify/.test(x.name));
    if (!t) return { done:'already gone', roles: arr.map(x=>x.name) };
    const tries = [
      `/api/v1/workspaces/roles/${t.id}`, `/api/v1/workspace/roles/${t.id}`,
      `/api/v1/workspaces/${W}/roles/${t.id}`, `/api/v1/roles/${t.id}`, `/api/v1/companies/roles/${t.id}`
    ];
    const out=[];
    for (const u of tries) {
      const r = await fetch(u, { method:'DELETE', credentials:'include' });
      const tx = await r.text();
      out.push({ path: u.replace(t.id,'{id}').replace(W,'{ws}'), s:r.status, k:(tx.match(/"key":"([^"]+)"/)||[])[1]||'' });
      if (r.status < 300) break;
    }
    const after = await (await fetch(`/api/v1/workspaces/${W}/roles`, { credentials:'include' })).json();
    const aarr = Array.isArray(after)?after:(after.roles||[]);
    return { attempts: out, rolesNow: aarr.map(x=>x.name) };
  });
};
