import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=channels`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out=[];
  for (let i=0;i<8;i++){
    out.push(await page.evaluate(function(){
      const t=(document.body.innerText||'').replace(/\s+/g,' ');
      return {hasNew: t.includes('e-dirprobe'), connecting:/Connecting…/.test(t),
              chans:(t.match(/PUBLIC|PRIVATE/g)||[]).length};
    }));
    await page.waitForTimeout(5000);
  }
  return out;
};
