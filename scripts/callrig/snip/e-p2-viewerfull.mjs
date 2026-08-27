import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const F='viewer.png';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const view = `(() => { ${VISFN} ${boxVisFn}
  const panels=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis)
    .filter(e=>/viewer\\.png/i.test(e.innerText||'')||/Open full-size|Open original/i.test(e.innerText||''));
  const p=panels[panels.length-1];
  if(!p) return {none:true};
  const imgs=[...p.querySelectorAll('img')].map(i=>{const r=i.getBoundingClientRect();
    return 'nat'+i.naturalWidth+'x'+i.naturalHeight+' rendered'+Math.round(r.width)+'x'+Math.round(r.height)
      +' fit='+getComputedStyle(i).objectFit+' vis='+vis(i);});
  return {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,220),
    ctrls: interactives(p).map(x=>x.label.slice(0,26)).join(' | ').slice(0,220), imgs}; })()`;
export default async ({page, ctx}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.tabsBefore = ctx.pages().length;
  out.openViewer = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /viewer\\.png/); })()`);
  await page.waitForTimeout(4000);
  out.viewer = await page.evaluate(view);
  out.clickFull = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const panels=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis)
      .filter(e=>/Open full-size|Open original/i.test(e.innerText||''));
    const p=panels[panels.length-1]; if(!p) return 'no panel';
    return clickDeepest(p, /Open full-size image|Open original/i); })()`);
  await page.waitForTimeout(4000);
  out.tabsAfter = ctx.pages().length;
  out.afterFull = await page.evaluate(view);
  out.urlNow = page.url().replace(/^https:\/\/[^/]+/,'');
  return out;
};
