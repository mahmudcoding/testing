import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CASES = [
  {name:'directories/people', path:'/w/'+WS+'/directories?tab=people', pattern:'**/api/v1/workspaces/*/members*'},
  {name:'files',              path:'/w/'+WS+'/files',                  pattern:'**/api/v1/users/me/files*'},
  {name:'calendar',           path:'/w/'+WS+'/calendar',               pattern:'**/api/v1/calendar/meetings*'},
];
export default async ({page}) => {
  const out={};
  for (const c of CASES) {
    let aborted=0;
    await page.route(c.pattern, r => { aborted++; r.abort('failed'); });
    await page.goto(BASE+c.path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(12000);
    out[c.name] = { aborted, ...(await page.evaluate(`(() => { ${VISFN}
      const strictVis = el => { const r=el.getBoundingClientRect(); if(r.width<24||r.height<12) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
          if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
      const m=document.querySelector('main')||document.body;
      const t=(m.innerText||'').replace(/\\s+/g,' ');
      const spinners=[...m.querySelectorAll('[role=progressbar],[class*=spin],[class*=skeleton],[aria-busy=true]')].filter(strictVis).length;
      const retry=[...m.querySelectorAll('button')].filter(strictVis)
        .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim())
        .filter(x=>/retry|try again|reload|refresh|повтор/i.test(x));
      const notes=[...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strictVis)
        .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      return { textLen:t.length, text:t.slice(0,200),
               mentionsError:/error|failed|wrong|unable|try again|ошиб/i.test(t),
               spinners, retryControls:retry, notices:notes.slice(0,3) }; })()`)) };
    await page.unroute(c.pattern);
  }
  return out;
};
