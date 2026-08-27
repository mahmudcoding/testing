import {WS, BASE} from './e-p2-helpers.mjs';
const probe = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const t=document.body.innerText.replace(/\s+/g,' ');
  const banner=[...document.querySelectorAll('[role=status],[role=alert],div,span')].filter(e=>vis(e)
    && e.children.length===0
    && /(offline|reconnect|connection|no internet|нет соединения|переподключ)/i.test(e.textContent||''))
    .map(e=>(e.textContent||'').trim().slice(0,60));
  return {navigatorOnline:navigator.onLine,
    mentionsOffline:/offline|reconnect|connection lost|no internet/i.test(t),
    banners:[...new Set(banner)].slice(0,4),
    composerPresent: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const online = await page.evaluate(probe);
  await page.context().setOffline(true);
  const samples=[];
  for(let i=0;i<20;i++){                     // 6 s offline
    samples.push({t:i*300, ...(await page.evaluate(probe))});
    await page.waitForTimeout(300);
  }
  await page.context().setOffline(false);
  await page.waitForTimeout(6000);
  const recovered = await page.evaluate(probe);
  const firstBanner = samples.find(s=>s.banners.length>0 || s.mentionsOffline);
  return {online, firstOfflineSignalAt: firstBanner? firstBanner.t : null,
    offlineBannerText: firstBanner? firstBanner.banners : null,
    lastOffline: samples[samples.length-1], recovered};
};
