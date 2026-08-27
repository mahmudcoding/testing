import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});   // BEFORE navigating
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('button').filter({hasText:/^Shared with me/}).first().click();
  await page.waitForTimeout(3500);
  async function rd(l){
    const r=await page.evaluate(function(){
      const t=(document.body.innerText||'');
      return {p3: t.includes('qa-e-recon4'),
              items: document.querySelectorAll('[data-testid="virtuoso-item-list"] > *').length,
              connecting: /Connecting…|Reconnecting/.test(t)};});
    return {at:l, ...r};
  }
  const log=[await rd('baseline blocked')];
  for (let i=1;i<=3;i++){ await page.waitForTimeout(10000); log.push(await rd('blocked t+'+(i*10)+'s')); }
  await cdp.send('Network.setBlockedURLs', {urls:[]});
  for (let i=1;i<=7;i++){ await page.waitForTimeout(6000); log.push(await rd('released t+'+(i*6)+'s')); }
  return log;
};
