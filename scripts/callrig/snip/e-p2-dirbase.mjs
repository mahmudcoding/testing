import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=channels`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out=[];
  for (let i=0;i<7;i++){
    out.push(await page.evaluate(function(){
      const t=(document.body.innerText||'').replace(/\s+/g,' ');
      const m=t.match(/e-search-control[^|]{0,60}/);
      return {snippet: m?m[0].slice(0,58):null, connecting:/Connecting…/.test(t)};
    }));
    await page.waitForTimeout(5000);
  }
  return out;
};
