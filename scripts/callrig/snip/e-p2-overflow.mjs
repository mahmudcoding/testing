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
  const more = page.locator('button').filter({hasText:/^\+\d+ more$/}).first();
  out.moreCount = await page.locator('button').filter({hasText:/^\+\d+ more$/}).count();
  out.moreLabel = out.moreCount? (await more.innerText()).trim() : null;
  await more.scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  out.moreState = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelectorAll('button')].find(x=>/^\\+\\d+ more$/.test((x.textContent||'').trim()));
    if(!b) return 'not found'; const r=b.getBoundingClientRect(); const cs=getComputedStyle(b);
    return {rect:Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height),
      disabled:b.disabled, pe:cs.pointerEvents, op:cs.opacity, expanded:b.getAttribute('aria-expanded'), vis:vis(b)}; })()`);
  await more.click();
  await page.waitForTimeout(2500);
  out.popover = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper],[role=menu]')].filter(boxVis);
    const p=boxes[boxes.length-1];
    if(!p) return 'no popover';
    const titles=(p.innerText||'').match(/QA-E [^\\n|]{0,26}/g)||[];
    return {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,340), distinctTitles:[...new Set(titles.map(t=>t.trim()))]}; })()`);
  return out;
};
