export default async ({ ctx }) => {
  const p = ctx.pages().find(x => x.url().includes('/guest/meeting/')) || ctx.pages()[0];
  const hit = await p.evaluate(() => {
    const b = document.querySelector('[data-testid="breakout-invite-accept"]');
    if (!b) return false; b.click(); return true; });
  await p.waitForTimeout(8000);
  return { accepted: hit,
    state: await p.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,180)) };
};
