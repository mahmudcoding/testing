import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const st = `(() => { ${VISFN}
  return {url:location.pathname,
    ws:(()=>{const b=[...document.querySelectorAll('button')].find(b=>vis(b)&&/workspace menu/i.test(b.getAttribute('aria-label')||'')); return b?(b.parentElement?.innerText||'').replace(/\\n+/g,'/').slice(0,36):null;})(),
    search:(()=>{const b=[...document.querySelectorAll('button')].find(b=>vis(b)&&/^Search /.test(b.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})(),
    channels:[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').trim().slice(0,20))}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.a_start = await page.evaluate(st);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2000);
  out.b_menu = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1];
    return p? {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,220), items:interactives(p).map(x=>x.label.slice(0,30)).join(' | ')}:'no menu'; })()`);
  out.c_switch = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]; if(!p) return 'no menu';
    return clickDeepest(p, /^Switch to /); })()`);
  await page.waitForTimeout(6000);
  out.d_after = await page.evaluate(st);
  // switch back
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]; return clickDeepest(p, /^Switch to /); })()`);
  await page.waitForTimeout(6000);
  out.e_back = await page.evaluate(st);
  return out;
};
