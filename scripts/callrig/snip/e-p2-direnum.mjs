import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=channels`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(function(){
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('e-search-control');
    // find the smallest element whose text contains the channel name
    let best=null;
    for (const el of document.querySelectorAll('*')) {
      const txt=(el.textContent||'');
      if (txt.includes('e-search-control') && txt.length < (best?best.textContent.length:1e9)) best=el;
    }
    const row = best ? best.closest('li,[role=row],div[class*=row],a,article') : null;
    return {around: i<0?null:t.slice(Math.max(0,i-30), i+170),
            smallestTag: best?best.tagName:null,
            rowText: row?(row.textContent||'').replace(/\s+/g,' ').trim().slice(0,190):null,
            memberMatch: (t.slice(i, i+200).match(/(\d+)\s*(members?|участник)/i)||[null,null])[0]};
  });
};
