import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url(); if(u.includes('/api/v1/search')) reqs.push(decodeURIComponent(u).replace(/^https:\/\/[^/]+\/api\/v1\/search\?/,'').slice(0,110)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    return clickDeepest(document.body, /^Search in channel$/); })()`);
  await page.waitForTimeout(3000);
  out.urlAfter = page.url().replace(/^https:\/\/[^/]+/,'');
  out.surface = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const m=document.querySelector('main');
    return {dialogOpen: !!d,
      where: d? 'dialog' : 'page',
      text: ((d||m).innerText||'').replace(/\\n+/g,' | ').slice(0,300),
      inputs: [...(d||m).querySelectorAll('input')].map(i=>(i.getAttribute('placeholder')||i.getAttribute('aria-label')||i.type)).join(' / ')}; })()`);
  // type a query that exists ONLY in the other channel
  const inp = page.locator('input[type=search], [role=dialog] input, main input').first();
  reqs.length=0;
  await inp.fill('qelanex7k2');
  await page.waitForTimeout(4000);
  out.otherChannelQuery = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const m=document.querySelector('main');
    const t=((d||m).innerText||'').replace(/\\n+/g,' ');
    const c=t.match(/All\\s+(\\d+)\\s+Messages\\s+(\\d+)/);
    return (c?'All='+c[1]+' Msg='+c[2]:'unparsed')+(/No results/.test(t)?' [EMPTY]':''); })()`);
  out.req = reqs.slice(-1)[0]||'(none)';
  return out;
};
