import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/this-route-does-not-exist-e2', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  return await page.evaluate(`(() => { ${VISFN}
     const t=(document.body.innerText||'').replace(/\\s+/g,' ');
     const main=document.querySelector('main')||document.body;
     const ctl=[...main.querySelectorAll('button,a[href]')].filter(vis)
       .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24)).filter(Boolean);
     return {url:location.pathname, msg:(t.match(/Page not found[^.]*\\.[^.]*\\./)||[''])[0].slice(0,110),
             mainControls:ctl.slice(0,5), n:ctl.length}; })()`);
};
