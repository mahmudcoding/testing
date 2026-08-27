const WS = 'W4QEF1XTURESO01', CO = 'O4QEF1XTURESO01';
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async ({ WS, CO }) => {
    const out = {};
    const rf = await fetch(`/api/v1/users/me/files?workspace_id=${WS}`, { credentials: 'include' });
    const fj = await rf.json().catch(() => null);
    const fa = Array.isArray(fj) ? fj : (fj?.files ?? fj?.items ?? fj?.data ?? []);
    out.files = fa.map(f => f.name ?? f.filename ?? f.original_name ?? null);
    const q = async (s) => {
      const r = await fetch(`/api/v1/search?q=${encodeURIComponent(s)}&company_id=${CO}&workspace_id=${WS}`, { credentials: 'include' });
      const j = await r.json().catch(() => null);
      const names = (j?.files ?? []).map(f => f.name ?? f.filename ?? f.original_name ?? '?');
      return `${String(s).padEnd(22)} ${r.status} files=${j?.total_files}  [${names.join(', ')}]`;
    };
    out.probes = [];
    for (const s of ['qa-e-image', 'qa-e-note', 'qa-e-general', 'qa-e-zzzz', 'image', 'note', 'zzzz', 'qa-e-image.png', 'nonexistent word here'])
      out.probes.push(await q(s));
    return out;
  }, { WS, CO });
};
