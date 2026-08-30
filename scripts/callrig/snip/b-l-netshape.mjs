/* sector L: shape only the HTTP/WS path (media is UDP) and watch both sides.
   Question: when signalling degrades but media does not, what is the user told? */
import { DOM } from './lib.mjs';
import { second } from './b-second.mjs';

const SEND = `async () => {
  const q = window.__qa;
  const g = t => { const n=document.querySelector('[data-testid="'+t+'"]');
    return n ? {vis:q.boxVis(n), text:(n.innerText||'').replace(/\\s+/g,' ').trim().slice(0,180)} : null; };
  const o = {ui:{
    prompt:g('call-quality-prompt'),
    applied:[...document.querySelectorAll('[data-testid="call-quality-applied"]')].filter(q.boxVis)
      .map(n=>({t:(n.innerText||'').replace(/\\s+/g,' ').trim().slice(0,100)})),
    mediaErr:g('call-media-error-banner'), lifeErr:g('call-lifecycle-error-banner'),
    recovery:g('call-connection-recovery-banner'),
    net:g('call-network-indicator'),
    notices:q.notices().filter(n=>n.w>40&&n.h>16).map(n=>n.text.slice(0,100)),
    cam:(()=>{const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim()));
      return b?q.nameOf(b).trim():null;})(),
    tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].length
  }, rtp:null, ice:null};
  for (const pc of (window.__pcs||[])) {
    if (pc.connectionState==='closed') continue;
    const s = await pc.getStats(); const v=[]; let pair=null;
    s.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video')
        v.push({b:r.bytesSent, fe:r.framesEncoded, fps:r.framesPerSecond, w:r.frameWidth, h:r.frameHeight, qlr:r.qualityLimitationReason});
      if(r.type==='candidate-pair'&&r.state==='succeeded') pair={rtt:r.currentRoundTripTime, br:r.availableOutgoingBitrate}; });
    o.rtp=v; o.ice={conn:pc.connectionState, iceState:pc.iceConnectionState, pair};
    break;
  }
  return o;
}`;
const RECV = `() => {
  const q=window.__qa;
  const tile=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>/QA Alice/.test(n.innerText||''));
  if(!tile) return {tile:false};
  const v=tile.querySelector('video');
  const pq=v&&v.getVideoPlaybackQuality?v.getVideoPlaybackQuality():null;
  const ph=tile.querySelector('[data-testid="participant-video-placeholder"]');
  const ni=tile.querySelector('[data-testid="participant-network-indicator"]');
  return {tile:true, hasVideo:!!v, tf:pq?pq.totalVideoFrames:null, ct:v?Math.round(v.currentTime*100)/100:null,
    ph:ph?q.boxVis(ph):false, netAria:ni?ni.getAttribute('aria-label'):null, netVis:ni?q.boxVis(ni):false,
    text:(tile.innerText||'').replace(/\\s+/g,' ').trim().slice(0,50)};
}`;

export default async ({ page, ctx }) => {
  await page.evaluate(DOM);
  const bob = await second('B','bob');
  await bob.page.evaluate(DOM);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const out={s:[]};
  const take = async (phase, t0) => {
    const a = await page.evaluate(`(${SEND})()`);
    const b = await bob.page.evaluate(`(${RECV})()`);
    out.s.push({phase, dt:Math.round((Date.now()-t0)/1000), a, b});
  };
  let t0=Date.now();
  for(let i=0;i<3;i++){ await page.waitForTimeout(3000); await take('base', t0); }
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:900,
    downloadThroughput: 60*1024, uploadThroughput: 30*1024});
  t0=Date.now();
  for(let i=0;i<22;i++){ await page.waitForTimeout(4000); await take('shaped', t0); }
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:0,
    downloadThroughput:-1, uploadThroughput:-1});
  t0=Date.now();
  for(let i=0;i<6;i++){ await page.waitForTimeout(4000); await take('restored', t0); }
  await bob.browser.close();
  return out;
};
