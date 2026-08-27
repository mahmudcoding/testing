export default async ({ ctx }) => {
  const out = [];
  for (const p of ctx.pages()) {
    const u = p.url();
    let alive = 'unknown', text = null;
    try { text = await p.evaluate(() => (document.body.innerText||'').slice(0,60), { timeout: 4000 }); alive = 'responsive'; }
    catch (e) { alive = 'unresponsive: ' + String(e).slice(0,40); }
    out.push({ url: u.slice(-46), alive, text });
  }
  return out;
};
