import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);

  async function rd(label) {
    const r = await page.evaluate(function () {
      return {
        chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length,
        has: (document.body.innerText || '').includes('QA-E late3'),
        connecting: /Connecting…|Reconnecting/.test(document.body.innerText || '')
      };
    });
    return { at: label, chips: r.chips, has: r.has, connecting: r.connecting };
  }

  const log = [await rd('baseline (blocked, pre-create)')];
  for (let i = 1; i <= 4; i++) { await page.waitForTimeout(10000); log.push(await rd('blocked t+' + (i*10) + 's')); }
  await cdp.send('Network.setBlockedURLs', {urls: []});
  for (let i = 1; i <= 9; i++) { await page.waitForTimeout(6000); log.push(await rd('released t+' + (i*6) + 's')); }
  return log;
};
