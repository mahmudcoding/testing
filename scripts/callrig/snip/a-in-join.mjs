import { UI_STATE } from './lib.mjs';
export default async ({page}) => {
  const CALL = process.env.QA_CALL;
  const WS='W4QAF1XTURESO01';
  if (!page.url().includes('/call/'+CALL)) {
    await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
  }
  const j = page.locator('button',{hasText:/^Join$/}).first();
  if (await j.count()) { await j.click(); await page.waitForTimeout(7000); }
  const ui = await page.evaluate('('+UI_STATE+')()');
  return {url: await page.evaluate(()=>location.pathname),
          buttons: (ui.buttons||[]).map(b=>b.l).filter(Boolean).slice(0,30)};
};
