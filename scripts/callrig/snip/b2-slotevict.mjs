export default async ({ ctx }) => {
  const link = process.env.QA_LINK;
  await ctx.clearCookies();
  const tabs = [], log = [];
  for (let i = 1; i <= 4; i++) {
    const t = await ctx.newPage();
    await t.goto(link, { waitUntil: 'domcontentloaded' });
    await t.waitForTimeout(4500);
    // name + join
    await t.evaluate(n => {
      const e = [...document.querySelectorAll('input')].find(x => x.type === 'text' && x.getBoundingClientRect().width > 0);
      if (!e) return;
      const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      s.call(e, 'Guest ' + n); e.dispatchEvent(new Event('input', { bubbles: true }));
    }, i);
    await t.waitForTimeout(800);
    await t.evaluate(() => {
      const b = [...document.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0)
        .find(x => /^(Join call|Ask to join|Join)$/i.test((x.innerText || '').trim()) && !x.disabled);
      if (b) b.click();
    });
    await t.waitForTimeout(7000);
    tabs.push(t);
    const cookies = await ctx.cookies();
    log.push({ joined: i,
      slots: cookies.filter(c => /aloqa_guest_s_/.test(c.name)).map(c => c.name).sort(),
      state: await t.evaluate(() => (document.body.innerText || '').replace(/\n+/g, ' | ').slice(0, 80)) });
  }
  const t1 = tabs[0];
  const asLeft = await t1.evaluate(() => (document.body.innerText || '').replace(/\n+/g, ' | ').slice(0, 200));
  await t1.reload({ waitUntil: 'domcontentloaded' }); await t1.waitForTimeout(7000);
  const afterReload = await t1.evaluate(() => (document.body.innerText || '').replace(/\n+/g, ' | ').slice(0, 200));
  for (const t of tabs) { try { await t.close(); } catch {} }
  return { sequence: log, tab1AsLeft: asLeft, tab1AfterReload: afterReload };
};
