// Simulates a real peer disconnect: open a spare page, then close the call page.
export default async ({page, ctx}) => {
  const before = await page.evaluate(()=>({url:location.href, inCall: !!document.querySelector('[data-testid="call-surface"], [data-testid="pip-mini-call"]')}));
  const spare = await ctx.newPage();
  await spare.goto('about:blank').catch(()=>{});
  await page.close();
  return {before, closed:true, pagesLeft: ctx.pages().length};
};
