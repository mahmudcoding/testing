import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const rows = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return {none:true};
  const all=[...d.querySelectorAll('li')];
  const sc=[...d.querySelectorAll('*')].find(n=>n.scrollHeight>n.clientHeight+4);
  return {domRows: all.length,
    visibleRows: all.filter(vis).length,
    visibleTexts: all.filter(vis).map(r=>(r.innerText||'').replace(/\\s+/g,' ').slice(0,34)),
    scrollTop: sc? sc.scrollTop : null, scrollH: sc? sc.scrollHeight : null, clientH: sc? sc.clientHeight : null}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  out.atTop = await page.evaluate(rows);
  // scroll the panel's scroller to the bottom
  out.scrolled = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const sc=[...d.querySelectorAll('*')].find(n=>n.scrollHeight>n.clientHeight+4);
    if(!sc) return 'no scroller'; sc.scrollTop = sc.scrollHeight; return 'scrolled to '+sc.scrollTop; })()`);
  await page.waitForTimeout(1800);
  out.atBottom = await page.evaluate(rows);
  const seen = new Set([...(out.atTop.visibleTexts||[]), ...(out.atBottom.visibleTexts||[])]);
  out.distinctRowsSeen = seen.size;
  out.allReachable = seen.size >= (out.atTop.domRows||0);
  return out;
};
