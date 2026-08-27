import {WS, BASE} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  const sockets=[];
  cdp.on('Network.webSocketCreated', e => sockets.push(e.url.replace(/token=[^&]*/,'token=<redacted>')));
  // block every websocket endpoint, then reload so the app cannot establish one
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  await page.goto(`${BASE}/w/${WS}/c/${GEN}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);

  const shot = async (label) => await page.evaluate((lbl)=> {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const vis=(el)=>{ if(!el) return false; const r=el.getBoundingClientRect();
      if(r.width<1||r.height<1) return false; let n=el,o=1;
      while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden') return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;}
      return o>0.01; };
    const banners=[...document.querySelectorAll('[role=status],[role=alert],[class*=banner],[class*=Banner],[class*=offline],[class*=connect]')]
      .filter(vis).map(e=>(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,80)).filter(Boolean);
    return {label:lbl,
      connWords: /Reconnect|reconnect|Offline|offline|Connecting|connection|Disconnected/.test(t),
      banners: [...new Set(banners)].slice(0,6),
      msgCount: document.querySelectorAll('[data-message-id]').length,
      composerEnabled: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      head: t.slice(0,110)};
  }, label);

  const t0 = await shot('t+3s');
  await page.waitForTimeout(12000);
  const t1 = await shot('t+15s');
  await page.waitForTimeout(15000);
  const t2 = await shot('t+30s');
  return {socketsAttempted: sockets.slice(0,4), readings:[t0,t1,t2]};
};
