import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const rd = async (l) => ({at:l, ...(await page.evaluate(()=> ({
    chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length,
    has: (document.body.innerText||'').includes('QA-E catchup'),
    connecting: /Connecting…|Reconnecting/.test(document.body.innerText||'')})))});
  const log=[await rd('blocked t+6s')];
  for (let i=1;i<=3;i++){ await page.waitForTimeout(10000); log.push(await rd(`blocked t+${6+i*10}s`)); }
  await cdp.send('Network.setBlockedURLs', {urls:[]});
  for (let i=1;i<=8;i++){ await page.waitForTimeout(6000); log.push(await rd(`released t+${i*6}s`)); }
  return log;
};
