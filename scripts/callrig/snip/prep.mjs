import { HOOK } from './lib.mjs';
export default async ({page, ctx}) => {
  await ctx.addInitScript(HOOK);
  await page.goto(process.env.QA_URL || 'https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  return await page.evaluate(() => ({url: location.href, hooked: !!window.__pcs, title: document.title}));
};
