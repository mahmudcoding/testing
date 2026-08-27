export default async ({ ctx }) => {
  const out = [];
  for (const p of ctx.pages()) {
    try { out.push(await p.evaluate(() => ({
      surface: !!document.querySelector('[data-testid="call-surface"]'),
      tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length,
      key: (document.body.innerText.match(/READY TO JOIN|Call ended|Leave call|End for everyone/g)||[]).slice(0,3)
    }))); } catch(e) { out.push({err:1}); }
  }
  return out;
};
