import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const wide = `(() => { ${VISFN} ${boxVisFn}
  const h=document.documentElement;
  const panels=[...document.querySelectorAll('[role=dialog],[role=menu],aside,[data-radix-popper-content-wrapper],[data-state="open"]')].filter(boxVis);
  return {
    dataAttrs: [...h.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+'='+a.value).join(' '),
    bodyKids: document.body.children.length,
    url: location.pathname,
    visiblePanels: panels.map(p=>p.tagName+(p.getAttribute('role')?'['+p.getAttribute('role')+']':'')+' "'+(p.innerText||'').replace(/\\s+/g,' ').slice(0,34)+'"'),
    toasts: [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').slice(0,40))
  }; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.a_baseline = await page.evaluate(wide);
  // shortcut, sampled over time in case it is animated in
  await page.keyboard.press('Meta+Shift+KeyT');
  const t=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(500); const s=await page.evaluate(wide);
    t.push('bk'+s.bodyKids+' panels'+s.visiblePanels.length); }
  out.b_shortcutTrace = [...new Set(t)].join(' -> ');
  out.b_after = await page.evaluate(wide);
  // button
  await page.locator('button[aria-label="Help & resources"]').first().click();
  await page.waitForTimeout(2500);
  out.c_helpOpen = await page.evaluate(wide);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /Toggle display settings/i); })()`);
  const t2=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(500); const s=await page.evaluate(wide);
    t2.push('bk'+s.bodyKids+' panels'+s.visiblePanels.length+' url'+s.url.slice(-12)); }
  out.d_buttonTrace = [...new Set(t2)].join(' -> ');
  out.d_after = await page.evaluate(wide);
  out.attrsIdentical = out.a_baseline.dataAttrs === out.d_after.dataAttrs;
  return out;
};
