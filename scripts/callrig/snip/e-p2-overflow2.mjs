import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /^Month$/); })()`);
  await page.waitForTimeout(5000);
  out.beforeState = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelectorAll('button')].find(x=>/^\\+\\d+ more$/.test((x.textContent||'').trim()));
    if(!b) return 'not found';
    b.scrollIntoView({block:'center'});
    const r=b.getBoundingClientRect(); const cs=getComputedStyle(b);
    return {label:(b.textContent||'').trim(), rect:Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height),
      disabled:b.disabled, pe:cs.pointerEvents, op:cs.opacity, expanded:b.getAttribute('aria-expanded'),
      state:b.getAttribute('data-state'), vis:vis(b)}; })()`);
  await page.waitForTimeout(1000);
  out.click = await page.evaluate(`(() => {
    const b=[...document.querySelectorAll('button')].find(x=>/^\\+\\d+ more$/.test((x.textContent||'').trim()));
    if(!b) return 'not found'; b.click();
    return 'clicked, aria-expanded now '+b.getAttribute('aria-expanded'); })()`);
  await page.waitForTimeout(2500);
  out.popover = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper],[role=menu]')].filter(boxVis);
    const p=boxes[boxes.length-1];
    if(!p) return 'no popover';
    const t=(p.innerText||'');
    const titles=[...new Set((t.match(/QA-E [A-Za-z0-9 ]{0,22}/g)||[]).map(x=>x.trim()))];
    return {text:t.replace(/\\n+/g,' | ').slice(0,340), distinctTitles:titles, nTitles:titles.length}; })()`);
  return out;
};
