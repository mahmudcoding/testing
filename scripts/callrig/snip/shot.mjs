import { UI_STATE } from './lib.mjs';
export default async ({page}) => {
  const f = process.env.QA_SHOT || '/tmp/shot.png';
  await page.screenshot({path: f});
  const ui = await page.evaluate('('+UI_STATE+')()');
  return {saved: f, text: ui.text, videos: ui.videos};
};
