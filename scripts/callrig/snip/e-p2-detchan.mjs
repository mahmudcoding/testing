import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const F='qa-e-image.png';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
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
  await page.waitForTimeout(1600);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=b[b.length-1]; return clickDeepest(p, /view details/i); })()`);
  await page.waitForTimeout(3000);
  // what IS the #qa-private node?
  out.channelNode = await page.evaluate(`(() => { ${VISFN}
    const hits=[...document.querySelectorAll('*')].filter(n=>/#qa-private/.test(n.textContent||'') && (n.textContent||'').length<40);
    const deepest=hits[hits.length-1];
    if(!deepest) return 'not found';
    const chain=[]; let n=deepest;
    for(let i=0;i<5 && n;i++){ const cs=getComputedStyle(n);
      chain.push('<'+n.tagName+(n.getAttribute('role')?' role='+n.getAttribute('role'):'')+'> cls='+String(n.className||'').slice(0,34)
        +' cursor='+cs.cursor+' tabindex='+(n.getAttribute('tabindex')??'-')+(n.tagName==='BUTTON'||n.tagName==='A'?' *INTERACTIVE*':''));
      n=n.parentElement; }
    return {text:(deepest.textContent||'').trim().slice(0,30), chain}; })()`);
  out.urlBefore = page.url().replace(/^https:\/\/[^/]+/,'');
  out.clickChannel = await page.evaluate(`(() => { ${VISFN}
    const hits=[...document.querySelectorAll('*')].filter(n=>/#qa-private/.test(n.textContent||'') && (n.textContent||'').length<40);
    const d=hits[hits.length-1]; if(!d) return 'not found';
    // click the deepest node and also any interactive ancestor
    d.click();
    return 'clicked <'+d.tagName+'>'; })()`);
  const t=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(600); t.push(page.url().replace(/^https:\/\/[^/]+/,'')); }
  out.urlTrace=[...new Set(t)].join(' -> ');
  return out;
};
