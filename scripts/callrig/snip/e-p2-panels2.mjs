import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
// containers: no hit-test (a dialog's own centre is covered by its children/backdrop)
const snap = `(() => { ${VISFN}
  const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
  const dlg=[...document.querySelectorAll('[role=dialog]')].filter(boxVis);
  const top = dlg[dlg.length-1] || null;
  return {
    nDialogs: dlg.length,
    text: top ? (top.innerText||'').replace(/\\n+/g,' | ').slice(0,700) : '(none)',
    ctrls: top ? interactives(top).map(d=>d.label.slice(0,32)+(d.disabled?'[DIS]':'')).join(' | ').slice(0,600) : '(none)',
    inputs: top ? [...top.querySelectorAll('input,textarea,[contenteditable=true]')].map(i=>(i.getAttribute('placeholder')||i.getAttribute('aria-label')||i.type||'?')).join(' / ').slice(0,200) : ''
  };
})()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  for (const t of ['Message requests','Open archived channels']) {
    await page.locator(`button[aria-label="${t}"]`).first().click();
    await page.waitForTimeout(2000);
    out[t] = await page.evaluate(snap);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
    out[t].closedAfterEsc = (await page.evaluate(snap)).nDialogs;
  }
  return out;
};
