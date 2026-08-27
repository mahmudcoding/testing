const WS = 'W4QEF1XTURESO01', CO = 'O4QEF1XTURESO01';
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async ({ WS, CO }) => {
    const q = async (s) => {
      const u = `/api/v1/search?q=${encodeURIComponent(s)}&company_id=${CO}&workspace_id=${WS}`;
      const r = await fetch(u, { credentials: 'include' });
      const j = await r.json().catch(() => null);
      const pick = (k, alt) => j?.[k] ?? j?.[alt] ?? (Array.isArray(j?.[alt]) ? j[alt].length : null);
      return {
        q: s, status: r.status,
        msgs: j?.total_messages ?? j?.messages?.length ?? null,
        files: j?.total_files ?? j?.files?.length ?? null,
        users: j?.total_users ?? j?.users?.length ?? null,
        chans: j?.total_channels ?? j?.channels?.length ?? null,
        keys: j ? Object.keys(j).slice(0, 14) : null,
      };
    };
    const out = { probes: [] };
    for (const s of ['QA Bob', 'Bob', 'qa_e_bob', 'QA Alice', 'Alice', 'qa-general', 'general', 'qa-private', 'qa']) {
      out.probes.push(await q(s));
    }
    return out;
  }, { WS, CO });
};
