import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const F=process.env.QA_FILE||'normal.txt';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,180);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,50)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.locator('main button').filter({hasText:F}).first().hover();
  await page.waitForTimeout(1300);
  await page.evaluate(`(() => { ${VISFN}
    const tiles=[...document.querySelectorAll('main button')].filter(b=>(b.textContent||'').includes(${JSON.stringify(F)}));
    const tr=tiles[0].getBoundingClientRect();
    const c=[...document.querySelectorAll('button[aria-label="More actions"]')].filter(vis)
      .sort((a,b)=>Math.abs(a.getBoundingClientRect().y-tr.y)-Math.abs(b.getBoundingClientRect().y-tr.y))[0];
    c && c.click(); })()`);
  await page.waitForTimeout(1800);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=b[b.length-1]; return clickDeepest(p, /^Share/i); })()`);
  await page.waitForTimeout(3000);
  out.dialog = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>(i.getAttribute('placeholder')||i.getAttribute('aria-label')||i.type))} : 'none'; })()`);
  // search a person and pick them
  const sr = page.locator('[role=dialog] input[type=search], input[placeholder*="Search channels or people"]').first();
  const n = await page.locator('input[placeholder*="Search channels or people"]').count();
  out.searchCount = n;
  if (n) { await page.locator('input[placeholder*="Search channels or people"]').first().fill('Bob'); await page.waitForTimeout(2500); }
  out.afterSearch = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,260),
      ctrls: interactives(d).map(x=>x.label.slice(0,26)).join(' | ').slice(0,240)} : 'none'; })()`);
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /QA Bob/); })()`);
  await page.waitForTimeout(2000);
  writes.length=0;
  out.send = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Send$/); })()`);
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,4);
  return out;
};
