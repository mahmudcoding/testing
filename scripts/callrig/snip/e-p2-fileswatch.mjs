import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  async function rd(label){
    const r = await page.evaluate(function(){
      const t=(document.body.innerText||'');
      return {has: t.includes('qa-e-reconnect-probe'),
              connecting: /Connecting…|Reconnecting/.test(t),
              rows: document.querySelectorAll('[data-testid*="file"],tbody tr').length};});
    return {at:label, ...r};
  }
  const log=[await rd('baseline blocked (pre-share)')];
  for (let i=1;i<=3;i++){ await page.waitForTimeout(10000); log.push(await rd('blocked t+'+(i*10)+'s')); }
  await cdp.send('Network.setBlockedURLs', {urls:[]});
  for (let i=1;i<=6;i++){ await page.waitForTimeout(6000); log.push(await rd('released t+'+(i*6)+'s')); }
  return log;
};
