import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const MID='S4OWKW57UWOK0WU', NAME='QA-E RSVP three';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const btns = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return 'NO CARD';
  return [...d.querySelectorAll('button')].filter(vis)
    .filter(b=>/^(Yes|No)$/.test((b.textContent||'').trim()))
    .map(b=>(b.textContent||'').trim()+(b.disabled?':DIS':':en')).join(',') || 'no Yes/No'; })()`;
export default async ({page}) => {
  const out={};
  // A: deep link
  await page.goto(BASE+'/w/'+WS+'/calendar/'+MID, {waitUntil:'domcontentloaded'});
  const tA=[]; for(let i=0;i<16;i++){ await page.waitForTimeout(1000); tA.push(await page.evaluate(btns)); }
  out.A_deepLink = [...new Set(tA)].join('  ->  ');
  // B: chip click, same page session
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:NAME}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  const tB=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(800); tB.push(await page.evaluate(btns)); }
  out.B_chipClick = [...new Set(tB)].join('  ->  ');
  // C: deep link again (second run, to rule out a one-off)
  await page.goto(BASE+'/w/'+WS+'/calendar/'+MID, {waitUntil:'domcontentloaded'});
  const tC=[]; for(let i=0;i<16;i++){ await page.waitForTimeout(1000); tC.push(await page.evaluate(btns)); }
  out.C_deepLinkAgain = [...new Set(tC)].join('  ->  ');
  return out;
};
