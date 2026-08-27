import {WS, BASE} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  const log=[];
  const snap = async (l) => { const r = await page.evaluate(()=> {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return { connecting: /Connecting…|Reconnecting/.test(t),
             hasToken: /missedoutage/.test(t),
             n: document.querySelectorAll('[data-message-id]').length }; });
    log.push({at:l, ...r}); return r; };

  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  await page.goto(`${BASE}/w/${WS}/c/${GEN}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await snap('blocked t+4s');                       // expect connecting=true

  // hold the block for 30 s — the alice post lands in this window
  for (let i=1;i<=3;i++){ await page.waitForTimeout(10000); await snap(`blocked t+${4+i*10}s`); }

  // release: the app should reconnect on its own, no reload
  await cdp.send('Network.setBlockedURLs', {urls:[]});
  for (let i=1;i<=6;i++){ await page.waitForTimeout(5000); await snap(`released t+${i*5}s`); }

  const finalHasToken = log[log.length-1].hasToken;
  // ground truth: is the message actually in the channel per the API?
  const api = await page.evaluate(async ({GEN})=> {
    const r=await fetch(`/api/v1/messaging/channels/${GEN}/messages?limit=5`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.messages||j.data||[];
    return {status:r.status, anyToken: JSON.stringify(arr).includes('missedoutage')};
  }, {GEN});
  return {log, finalHasToken, api};
};
