export default async ({ ctx }) => {
  const link = process.env.QA_LINK;
  await ctx.clearCookies();
  const tabs = [], report = [];
  for (let i = 1; i <= 4; i++) {
    const t = await ctx.newPage();
    await t.goto(link, { waitUntil: 'domcontentloaded' });
    await t.waitForTimeout(5000);
    tabs.push(t);
    const cookies = await ctx.cookies();
    const slots = cookies.filter(c => /aloqa_guest_s_/.test(c.name)).map(c => c.name).sort();
    report.push({ opened: i, guestCookies: slots,
      text: (await t.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,90))) });
  }
  // now inspect tab 1, first as it stands, then reloaded
  const t1 = tabs[0];
  const asLeft = await t1.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,180));
  await t1.reload({ waitUntil: 'domcontentloaded' }); await t1.waitForTimeout(6000);
  const afterReload = await t1.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,180));
  for (const t of tabs) { try { await t.close(); } catch {} }
  return { sequence: report, tab1AsLeft: asLeft, tab1AfterReload: afterReload };
};
