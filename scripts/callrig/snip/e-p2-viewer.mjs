import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  const listState = `(() => { ${VISFN}
    const m=document.querySelector('main');
    const tiles=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/\\.(txt|png)/.test(b.textContent||''));
    return {n:tiles.length, firstBox: tiles[0]? Math.round(tiles[0].getBoundingClientRect().width)+'x'+Math.round(tiles[0].getBoundingClientRect().height):null,
      order: tiles.map(t=>(t.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22)),
      viewBtns: [...m.querySelectorAll('button')].filter(b=>vis(b)&&/view$/i.test(b.getAttribute('aria-label')||''))
        .map(b=>b.getAttribute('aria-label')+' pressed='+(b.getAttribute('aria-pressed')??'-')+' state='+(b.getAttribute('data-state')||'-'))}; })()`;
  out.gridDefault = await page.evaluate(listState);
  // toggle to list view
  await page.getByRole('button',{name:'List view'}).first().click();
  await page.waitForTimeout(2500);
  out.listView = await page.evaluate(listState);
  // persistence across reload
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  out.afterReload = await page.evaluate(listState);
  // open the viewer on a text file
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /normal\\.txt/); })()`);
  await page.waitForTimeout(4000);
  out.viewer = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis);
    const p=boxes[boxes.length-1];
    if(!p) return {none:true, url:location.pathname+location.search};
    return {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
      ctrls: interactives(p).map(x=>x.label.slice(0,26)).join(' | ').slice(0,300),
      showsFileContent: /hello|lane E|payload/i.test(p.innerText||'')}; })()`);
  return out;
};
