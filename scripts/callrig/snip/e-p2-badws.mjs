import {VISFN, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{ if(r.status()>=400 && /\/api\/v1\//.test(r.url())){
    let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({st:r.status(), u:decodeURIComponent(r.url().split('/api/v1/')[1]).slice(0,60), body:b}); }});
  await page.goto('about:blank'); await page.waitForTimeout(800);
  await page.goto(BASE+'/w/W0000000000BOGUS/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  const ui = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m?m.innerText:'').replace(/\\s+/g,' ');
     return {url:location.pathname, mainHead:t.slice(0,110),
             nControls:[...(m?m.querySelectorAll('button,a[href]'):[])].filter(vis).length,
             rawKeyOnScreen:/[A-Z]{3,}_[A-Z_]{3,}|trace_id/.test(t)}; })()`);
  return {ui, apiErrors:net.slice(0,6)};
};
