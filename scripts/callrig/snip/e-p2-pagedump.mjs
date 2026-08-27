import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for(const route of ['/calendar','/c/C4QEGENERAL0001']){
    await page.goto(BASE+'/w/'+WS+route, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    out[route] = await page.evaluate(`(() => { ${VISFN}
       const t=(document.body.innerText||'').replace(/\\s+/g,' ');
       return {hasGeneralText: /qa-general/i.test(t),
               nNav: document.querySelectorAll('nav').length,
               nAside: document.querySelectorAll('aside').length,
               bodyHead: t.slice(0,300)}; })()`);
  }
  return out;
};
