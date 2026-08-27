import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('button').filter({hasText:/^Shared with me/}).first().click();
  await page.waitForTimeout(3000);
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  async function rd(l){
    const r=await page.evaluate(function(){
      const t=(document.body.innerText||'');
      return {probe2: t.includes('qa-e-recon2'),
              items: document.querySelectorAll('[data-testid="virtuoso-item-list"] > *').length,
              connecting: /Connecting…|Reconnecting/.test(t)};});
    return {at:l, ...r};
  }
  const log=[await rd('baseline blocked')];
  for (let i=1;i<=2;i++){ await page.waitForTimeout(10000); log.push(await rd('blocked t+'+(i*10)+'s')); }
  await cdp.send('Network.setBlockedURLs', {urls:[]});
  for (let i=1;i<=6;i++){ await page.waitForTimeout(6000); log.push(await rd('released t+'+(i*6)+'s')); }
  return log;
};
