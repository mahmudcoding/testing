import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const W2='W4OWJSPNXQJYZ5R';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const bell = `(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^Notifications/i.test(b.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})()`;
async function run(page, ws, BASEu) {
  const out={};
  await page.goto(BASEu+'/w/'+ws+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  out.beforeBell = await page.evaluate(bell);
  out.beforeUrl = page.url().replace(/^https:\/\/[^/]+/,'');
  // click the real BUTTON row via Playwright (real mouse event)
  const btn = page.locator('li button').filter({hasText:/starting soon/i}).first();
  out.btnCount = await page.locator('li button').filter({hasText:/starting soon/i}).count();
  try { await btn.click({timeout:9000}); out.clicked=true; } catch(e){ out.clicked='ERR '+String(e).replace(/\s+/g,' ').slice(0,110); }
  const t=[]; for(let i=0;i<14;i++){ await page.waitForTimeout(400); t.push(page.url().replace(/^https:\/\/[^/]+\/w\//,'').slice(0,44)); }
  out.urlTrace=[...new Set(t)].join(' -> ');
  out.afterBell = await page.evaluate(bell);
  out.afterUrl = page.url().replace(/^https:\/\/[^/]+/,'');
  out.panelOpen = await page.evaluate(`(() => { ${boxVisFn} return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length; })()`);
  return out;
}
export default async ({page}) => {
  return { fromOwnWorkspace: await run(page, WS, BASE), fromOtherWorkspace: await run(page, W2, BASE) };
};
