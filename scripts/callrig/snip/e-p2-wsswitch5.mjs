import {WS, BASE} from './e-p2-helpers.mjs';
const snap = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  return {url:location.pathname,
    channels:[...document.querySelectorAll('a')].filter(vis)
      .filter(a=>/\/c\//.test(a.getAttribute('href')||''))
      .map(a=>(a.textContent||'').replace(/\s+/g,' ').trim().slice(0,20)),
    dmCount:[...document.querySelectorAll('a')].filter(vis).filter(a=>/\/d\//.test(a.getAttribute('href')||'')).length,
    rail:[...document.querySelectorAll('a')].filter(vis).map(a=>(a.getAttribute('aria-label')||a.textContent||'').trim())
      .filter(t=>/^(Chat|Calls|Calendar|Files|Directories)$/.test(t)),
    main:(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,50)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(snap);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2500);
  await page.locator('[aria-label="Switch to QA E Second"]').first().click();
  await page.waitForTimeout(6500);
  const after = await page.evaluate(snap);
  // and back
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2500);
  const backLabel = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const e=[...document.querySelectorAll('[aria-label^="Switch to "]')].filter(vis)[0];
    return e? e.getAttribute('aria-label') : null;
  });
  let back=null;
  if(backLabel){ await page.locator(`[aria-label="${backLabel}"]`).first().click(); await page.waitForTimeout(6000);
    back = await page.evaluate(snap); }
  return {before, after, backLabel, back,
    switched: after.url!==before.url, returned: back? back.url===before.url : null};
};
