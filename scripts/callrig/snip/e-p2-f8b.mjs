import {BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/calendar/join/NOTAREALTOKEN12345', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  return await page.evaluate(`(() => {
     const q=s=>[...document.querySelectorAll(s)];
     const desc=e=>({tag:e.tagName, tabindex:e.getAttribute('tabindex'),
        role:e.getAttribute('role'), al:e.getAttribute('aria-label'),
        cls:(e.className||'').toString().slice(0,40),
        rect:(()=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];})()});
     return {
       'button':            q('button').length,
       'a[href]':           q('a[href]').length,
       '[tabindex]':        q('[tabindex]').length,
       'combined':          q('button, a[href], [tabindex]').length,
       'combinedDetail':    q('button, a[href], [tabindex]').map(desc),
       bodyText:(document.body.innerText||'').trim()
     }; })()`);
};
