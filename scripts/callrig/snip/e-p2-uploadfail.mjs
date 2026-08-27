import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(/upload/.test(u)&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,180);}catch(e){}
    writes.push(r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.getByRole('button',{name:'Upload'}).first().click();
  await page.waitForTimeout(2500);
  await page.locator('input[type=file]').first().setInputFiles([DIR+'/empty.txt']);
  await page.waitForTimeout(3000);
  out.queueBefore = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return (d.innerText||'').replace(/\\n+/g,' | ').slice(0,400); })()`);
  writes.length=0;
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Upload \\d+ files?$|^Upload 1 file$/); })()`);
  await page.waitForTimeout(8000);
  out.uploadResponses = writes.slice(0,3);
  out.queueAfter = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return 'dialog closed';
    return { full:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,420),
      visibleLeaves:[...d.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
        .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44)),
      ctrls: interactives(d).map(x=>x.label.slice(0,24)).join(' | ').slice(0,220) }; })()`);
  out.toasts = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,4); })()`);
  return out;
};
