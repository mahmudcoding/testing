import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  async function rd(label){
    const r = await page.evaluate(function(){
      return {chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length,
              has: (document.body.innerText||'').includes('QA-E heal'),
              connecting: /Connecting…|Reconnecting/.test(document.body.innerText||'')};});
    return {at:label, ...r};
  }
  const log=[await rd('baseline blocked')];
  return {phase:'ready', log};
};
