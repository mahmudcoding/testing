import {WS, BASE} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  await page.goto(`${BASE}/w/${WS}/c/${GEN}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);

  const read = async (l) => ({at:l, ...(await page.evaluate(()=> {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return {connecting:/Connecting…|Reconnecting/.test(t),
            mine: /offlinecompose/.test(t),
            n: document.querySelectorAll('[data-message-id]').length};}))});

  const before = await read('before typing (blocked)');
  // type into the real composer and press Enter, as a user would
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const found = await comp.count();
  let postStatus=null;
  page.on('response', r => { if (r.url().includes('/messaging/messages') && r.request().method()==='POST') postStatus=r.status(); });
  if (found) {
    await comp.click();
    await page.keyboard.type('offlinecompose probe', {delay:40});
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(4000);
  const t1 = await read('4s after Enter (still blocked)');
  await page.waitForTimeout(10000);
  const t2 = await read('14s after Enter (still blocked)');

  await cdp.send('Network.setBlockedURLs', {urls:[]});
  await page.waitForTimeout(20000);
  const t3 = await read('20s after release');
  await page.waitForTimeout(20000);
  const t4 = await read('40s after release');
  return {composerFound: found>0, postStatus, readings:[before,t1,t2,t3,t4]};
};
