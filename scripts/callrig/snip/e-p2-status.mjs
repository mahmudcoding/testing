import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const body = (code,key,msg) => JSON.stringify({code, key, message:msg, trace_id:'t-probe'});
const CASES = [
  {name:'members 500', pattern:'**/api/v1/workspaces/*/members*', path:'/w/'+WS+'/directories?tab=people',
   st:500, b:body(500,'COMMON_INTERNAL','internal server error')},
  {name:'members 403', pattern:'**/api/v1/workspaces/*/members*', path:'/w/'+WS+'/directories?tab=people',
   st:403, b:body(403,'COMMON_FORBIDDEN','forbidden')},
  {name:'meetings 500', pattern:'**/api/v1/calendar/meetings*', path:'/w/'+WS+'/calendar',
   st:500, b:body(500,'COMMON_INTERNAL','internal server error')},
  {name:'files 403', pattern:'**/api/v1/users/me/files*', path:'/w/'+WS+'/files',
   st:403, b:body(403,'COMMON_FORBIDDEN','forbidden')},
];
export default async ({page}) => {
  const out={};
  for (const c of CASES) {
    let hits=0;
    await page.route(c.pattern, r => { hits++; r.fulfill({status:c.st, contentType:'application/json', body:c.b}); });
    await page.goto(BASE+c.path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(11000);
    out[c.name] = { hits, ...(await page.evaluate(`(() => {
      const strictVis = el => { const r=el.getBoundingClientRect(); if(r.width<24||r.height<12) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
          if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
      const m=document.querySelector('main')||document.body;
      const t=(m.innerText||'').replace(/\\s+/g,' ');
      const btns=[...m.querySelectorAll('button')].filter(strictVis)
        .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean);
      const spin=[...m.querySelectorAll('[role=progressbar],[class*=spin],[class*=skeleton],[aria-busy=true]')].filter(strictVis).length;
      return { text:t.slice(0,180), spinners:spin,
               hasRetry:btns.some(b=>/^Retry$/i.test(b)),
               leaksRaw:/trace_id|COMMON_|t-probe|internal server error/i.test(t) }; })()`)) };
    await page.unroute(c.pattern);
  }
  return out;
};
