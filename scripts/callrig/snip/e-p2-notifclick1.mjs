import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  // describe the row element BEFORE clicking: is it interactive at all?
  out.rowDesc = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]; if(!p) return 'no panel';
    const hit=[...p.querySelectorAll('*')].filter(n=>/starting soon/i.test(n.textContent||'') && (n.textContent||'').length<200);
    const deepest=hit[hit.length-1];
    const chain=[]; let n=deepest;
    while(n && n!==p && chain.length<6){ chain.push(n.tagName+(n.getAttribute('role')?'[role='+n.getAttribute('role')+']':'')+(n.tagName==='BUTTON'||n.tagName==='A'?'*CLICKABLE*':'')+'.'+String(n.className||'').slice(0,28)); n=n.parentElement; }
    return {deepestText:(deepest?.textContent||'').replace(/\\s+/g,' ').slice(0,60), chain};
  })()`);
  out.before = {url: page.url().replace(/^https:\/\/[^/]+/,''), bell: await page.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^Notifications/i.test(b.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})()`)};
  const clicked = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]; if(!p) return 'no panel';
    const rows=[...p.querySelectorAll('button,[role=menuitem],a,li,div')].filter(n=>vis(n)&&/starting soon/i.test(n.textContent||'')&&(n.textContent||'').length<250);
    if(!rows.length) return 'no row';
    const r=rows[0]; r.click(); return 'clicked <'+r.tagName+'> '+(r.textContent||'').replace(/\\s+/g,' ').slice(0,50); })()`);
  out.clicked = clicked;
  const t=[]; for(let i=0;i<14;i++){ await page.waitForTimeout(400); t.push(page.url().replace(/^https:\/\/[^/]+\/w\//,'').slice(0,40)); }
  out.urlTrace=[...new Set(t)].join(' -> ');
  out.after = {url: page.url().replace(/^https:\/\/[^/]+/,''), bell: await page.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^Notifications/i.test(b.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})()`)};
  return out;
};
