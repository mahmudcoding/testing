import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.getByRole('button',{name:'Upload'}).first().click();
  await page.waitForTimeout(2600);
  await page.locator('input[type=file]').first().setInputFiles([DIR+'/tall.txt']);
  await page.waitForTimeout(3400);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Upload \\d+ files?$/); })()`);
  await page.waitForTimeout(8000);
  await page.keyboard.press('Escape'); await page.waitForTimeout(2000);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  const tile = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
       .find(x=>/tall\\.txt/i.test(x.getAttribute('aria-label')||x.textContent||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.tile=tile; if(tile.none) return out;
  await page.mouse.click(tile.cx, tile.cy); await page.waitForTimeout(6000);
  out.viewer = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {none:true};
     const scrollables=[...d.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+4 && e.clientHeight>40)
       .map(e=>({tag:e.tagName, cls:String(e.className||'').slice(0,30), ch:e.clientHeight, sh:e.scrollHeight,
                 overflowY:getComputedStyle(e).overflowY}));
     return {text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,110), scrollables:scrollables.slice(0,4)}; })()`);
  if(out.viewer.scrollables && out.viewer.scrollables.length){
    out.scrollTest = await page.evaluate(`(() => { ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const e=[...d.querySelectorAll('*')].filter(x=>x.scrollHeight>x.clientHeight+4 && x.clientHeight>40)[0];
       const before=e.scrollTop; e.scrollTop=e.scrollHeight;
       return {before, after:e.scrollTop, max:e.scrollHeight-e.clientHeight, moved:e.scrollTop>before}; })()`);
    // and a real wheel over the viewer
    const box = await page.evaluate(`(() => { ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const e=[...d.querySelectorAll('*')].filter(x=>x.scrollHeight>x.clientHeight+4 && x.clientHeight>40)[0];
       e.scrollTop=0; const r=e.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    await page.mouse.move(box.cx, box.cy); await page.mouse.wheel(0, 600); await page.waitForTimeout(1500);
    out.wheelTest = await page.evaluate(`(() => { ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const e=[...d.querySelectorAll('*')].filter(x=>x.scrollHeight>x.clientHeight+4 && x.clientHeight>40)[0];
       return {scrollTop:e.scrollTop, movedByWheel:e.scrollTop>0}; })()`);
  }
  await page.keyboard.press('Escape');
  return out;
};
