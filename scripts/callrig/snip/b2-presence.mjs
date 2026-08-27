export default async ({ page }) => {
  return await page.evaluate(async () => {
    const ws = 'W4QBF1XTURESO01';
    const r = await fetch(`/api/v1/workspaces/${ws}/presence`, {credentials:'include'});
    const txt = await r.text();
    let parsed = null;
    try { const j = JSON.parse(txt);
      const arr = Array.isArray(j) ? j : (j.presence || j.users || j.data || []);
      parsed = arr.map(p => ({ id:(p.user_id||p.id||'').slice(-8), st:p.status||p.presence||p.state,
                               custom:p.custom_status||p.status_text||p.emoji_status||null }));
    } catch(e) { parsed = 'parse-fail'; }
    return { status: r.status, parsed, raw: txt.slice(0, 260) };
  });
};
