import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=channels`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(function(){
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return {hasNew: t.includes('e-dirprobe'), chans:(t.match(/PUBLIC|PRIVATE/g)||[]).length,
            around:(function(){const i=t.indexOf('e-dirprobe'); return i<0?null:t.slice(Math.max(0,i-20), i+90);})()};
  });
};
