import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const rtc = await page.evaluate('('+RTC_STATS+')()');
  const ui = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {
      tabs: (document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,120),
      screenLabels: [...s.querySelectorAll('*')].filter(e=>e.children.length===0 && /'s screen/.test(e.textContent)).map(e=>e.textContent.trim()),
      videos: [...s.querySelectorAll('video')].map(v=>({lbl:(v.closest('[aria-label]')||{}).getAttribute?.('aria-label'), vw:v.videoWidth, paused:v.paused})),
      participants: [...s.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(b=>b.getAttribute('aria-label')),
      text: s.innerText.replace(/\n+/g,' | ').slice(0,300)
    };
  });
  return {ui, inbound: rtc.stats.flatMap(pc=>pc.in.map(x=>`${x.kind} ${x.w||''}x${x.h||''} bytes=${x.bytes}`))};
};
