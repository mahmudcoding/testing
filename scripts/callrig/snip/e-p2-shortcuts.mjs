import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const snap = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis);
  const top=d[d.length-1];
  return {url:location.pathname, nDialogs:d.length,
    dialogTitle: top? (top.innerText||'').split('\\n')[0].slice(0,44) : null,
    focused: document.activeElement? document.activeElement.tagName+'['+(document.activeElement.getAttribute('aria-label')||document.activeElement.getAttribute('placeholder')||'')+']' : null}; })()`;
export default async ({page}) => {
  const out={};
  const isMac = true;
  const mod = isMac ? 'Meta' : 'Control';
  for (const [ctx, path] of [['calendar','/calendar'], ['channel','/c/C4QEGENERAL0001'], ['files','/files']]) {
    await page.goto(BASE+'/w/'+WS+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    const o={};
    o.before = await page.evaluate(snap);
    // Cmd+K
    await page.keyboard.press(mod+'+KeyK');
    await page.waitForTimeout(2500);
    o.cmdK = await page.evaluate(snap);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
    // Cmd+N
    await page.keyboard.press(mod+'+KeyN');
    await page.waitForTimeout(2500);
    o.cmdN = await page.evaluate(snap);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
    // Cmd+Shift+T
    await page.keyboard.press(mod+'+Shift+KeyT');
    await page.waitForTimeout(2500);
    o.cmdShiftT = await page.evaluate(snap);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    out[ctx]=o;
  }
  return out;
};
