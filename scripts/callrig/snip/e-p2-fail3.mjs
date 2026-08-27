import {WS, BASE} from './e-p2-helpers.mjs';
const view = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  // the panel may be a dialog, a popover, or an aside — do not pre-filter to one
  const cands=[...document.querySelectorAll('[role=dialog],[role=menu],[data-state=open],aside,section')].filter(vis)
    .filter(e=>/notification/i.test(e.innerText||'')||/Mark all as read/i.test(e.innerText||''));
  const d=cands.sort((a,b)=>b.innerText.length-a.innerText.length)[0];
  if(!d) return {panel:false};
  const t=d.innerText.replace(/\s+/g,' ');
  return {panel:true, len:t.length,
    saysError:/(error|wrong|failed|try again|retry|ошибк|повтор)/i.test(t),
    hasRetry:[...d.querySelectorAll('button')].filter(vis).some(e=>/retry|try again|повтор/i.test(e.textContent||'')),
    saysEmpty:/no notification|nothing|пусто|empty/i.test(t),
    spinner: !!d.querySelector('[role=progressbar],[class*=spinner i],[class*=skeleton i]'),
    text:t.slice(0,260)};
};
export default async ({page}) => {
  const out={};
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  out.bellLabel = await bell.getAttribute('aria-label');
  await bell.click(); await page.waitForTimeout(3000);
  out.baseline = await page.evaluate(view);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // cold-load the app with the notifications endpoint failing
  await page.route('**/api/v1/notifications**', r => r.abort('failed'));
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(6000);
  out.aborted = await page.evaluate(view);
  await page.unroute('**/api/v1/notifications**');
  return out;
};
