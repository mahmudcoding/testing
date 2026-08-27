const WS = 'W4QEF1XTURESO01', CO = 'O4QEF1XTURESO01';
export default async ({ page }) => {
  if (!page.url().includes('airion-cargo')) await page.goto('https://airion-cargo.store/', { waitUntil: 'domcontentloaded' });
  return await page.evaluate(async ({ WS, CO }) => {
    const q = async (s) => {
      const r = await fetch(`/api/v1/search?q=${encodeURIComponent(s)}&company_id=${CO}&workspace_id=${WS}`, { credentials: 'include' });
      const j = await r.json().catch(() => null);
      return `${String(s).padEnd(14)} ${r.status}  msgs=${j?.total_messages} files=${j?.total_files} users=${j?.total_users} chans=${j?.total_channels}`;
    };
    const lines = [];
    for (const s of ['QA Bob', 'Bob', 'bob', 'qa_e_bob', 'QA Alice', 'Alice', 'qa-general', 'general', 'qa-private', 'qa', 'Carol', 'Owner'])
      lines.push(await q(s));
    return lines;
  }, { WS, CO });
};
