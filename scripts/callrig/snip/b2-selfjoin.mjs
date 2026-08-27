export default async ({ page, ctx }) => {
  const link = process.env.QA_LINK;
  const before = { tabs: ctx.pages().length };
  const tab = await ctx.newPage();
  await tab.goto(link, { waitUntil: 'domcontentloaded' });
  await tab.waitForTimeout(7000);
  const second = await tab.evaluate(() => ({
    url: location.pathname,
    text: document.body.innerText.replace(/\n+/g,' | ').slice(0, 200),
    buttons: [...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.innerText||'').trim()).filter(Boolean).slice(0,8) }));
  const first = await page.evaluate(() => ({
    url: location.pathname,
    surface: !!document.querySelector('[data-testid="call-surface"]'),
    tail: document.body.innerText.replace(/\n+/g,' | ').slice(-140) }));
  return { before, secondTab: second, firstTab: first, tabsNow: ctx.pages().length };
};
