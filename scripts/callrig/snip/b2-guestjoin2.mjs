export default async ({ ctx }) => {
  const link = process.env.QA_LINK;
  await ctx.clearCookies();
  const t = await ctx.newPage();
  await t.goto(link, { waitUntil: 'domcontentloaded' });
  await t.waitForTimeout(4500);
  await t.evaluate(() => {
    const e = [...document.querySelectorAll('input')].find(x => x.type === 'text' && x.getBoundingClientRect().width > 0);
    if (!e) return;
    const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    s.call(e, 'Leak Guest'); e.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await t.waitForTimeout(700);
  await t.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /^(Join call|Ask to join|Join)$/i.test((x.innerText || '').trim()) && !x.disabled);
    if (b) b.click();
  });
  await t.waitForTimeout(9000);
  return { url: t.url().slice(-40),
    state: await t.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,110)),
    breakoutBtn: await t.evaluate(() => !!document.querySelector('[data-testid="call-controls-breakout-rooms"]')) };
};
