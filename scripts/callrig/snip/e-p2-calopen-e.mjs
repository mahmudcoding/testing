import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=> ({
    url: location.pathname+location.search,
    chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length,
    hasLiveProbe: (document.body.innerText||'').includes('QA-E liveprobe'),
    connecting: /Connecting…|Reconnecting/.test(document.body.innerText||'')
  }));
};
