import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const dump = `(() => { ${VISFN}
  const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
  const boxes=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
  const p=boxes[boxes.length-1];
  return { n: boxes.length, url: location.pathname,
    text: p?(p.innerText||'').replace(/\\n+/g,' | ').slice(0,600):'(none)',
    ctrls: p?interactives(p).map(d=>d.label.slice(0,30)+(d.disabled?'[DIS]':'')).join(' | ').slice(0,600):'(none)',
    inputs: p?[...p.querySelectorAll('input,textarea')].map(i=>(i.getAttribute('placeholder')||i.getAttribute('aria-label')||i.name||i.type)).join(' / ').slice(0,250):'' };
})()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(1500);
  out.menu = await page.evaluate(dump);
  try {
    await page.getByRole('menuitem', {name:/Create workspace/i}).first().click({timeout:6000});
  } catch(e) {
    try { await page.getByRole('button', {name:/Create workspace/i}).first().click({timeout:6000}); }
    catch(e2){ out.clickErr = String(e2).replace(/\s+/g,' ').slice(0,140); }
  }
  await page.waitForTimeout(3000);
  out.afterCreateClick = await page.evaluate(dump);
  out.url = page.url().replace(/^https:\/\/[^/]+/,'');
  return out;
};
