import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  out.rows = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? [...d.querySelectorAll('li button')].filter(vis).map(b=>(b.innerText||'').replace(/\\s+/g,' ').slice(0,64)) : ['no panel']; })()`);
  const inv = page.locator('li button').filter({hasText:/invited to "QA-E Delete probe"/i}).first();
  out.found = await page.locator('li button').filter({hasText:/invited to "QA-E Delete probe"/i}).count();
  if (!out.found) return out;
  await inv.click();
  await page.waitForTimeout(6000);
  out.landedUrl = page.url().replace(/^https:\/\/[^/]+/,'');
  out.screen = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const leaves=[...document.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
      .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,42));
    return {dialogText: d? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,300):null,
      visible:[...new Set(leaves)].slice(0,16)}; })()`);
  return out;
};
