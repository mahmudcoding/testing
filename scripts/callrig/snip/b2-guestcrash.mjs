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
    s.call(e, 'Crash Guest'); e.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await t.waitForTimeout(700);
  await t.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /^(Join call|Ask to join|Join)$/i.test((x.innerText || '').trim()) && !x.disabled);
    if (b) b.click();
  });
  await t.waitForTimeout(8000);
  const joined = await t.evaluate(() => (document.body.innerText || '').replace(/\n+/g, ' | ').slice(0, 90));
  // crash the renderer — an ordinary browser crash, not a clean close
  let crashed = 'no';
  try {
    const cdp = await ctx.newCDPSession(t);
    await cdp.send('Page.crash').catch(() => {});
    crashed = 'Page.crash sent';
  } catch (e) { crashed = 'crash failed: ' + String(e).slice(0, 50); }
  await new Promise(r => setTimeout(r, 3000));
  return { joinedAs: joined, crashed, pagesLeft: ctx.pages().length };
};
