import { UI_STATE } from './lib.mjs';
export default async ({page}) => {
  const want = (process.env.QA_BTN||'').split('||');
  const wait = Number(process.env.QA_WAIT||3000);
  const done = [];
  for (const w of want) {
    if (!w) continue;
    const el = await page.$(`button[aria-label="${w}"]`) || await page.$(`button:has-text("${w}")`);
    if (!el) { done.push('MISSING:'+w); continue; }
    await el.click(); done.push('clicked:'+w);
    await page.waitForTimeout(wait);
  }
  const ui = await page.evaluate('('+UI_STATE+')()');
  return {done, text: ui.text, videos: ui.videos, buttons: ui.buttons.map(b=>b.l+(b.p!==null?'['+b.p+']':'')).join(', ')};
};
