import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; let aborted=0, allowed=0;
  const pattern='**/api/v1/workspaces/*/members*';
  let fail=true;
  await page.route(pattern, r => { if(fail){ aborted++; r.abort('failed'); } else { allowed++; r.continue(); } });
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  const state = `(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     return { text:t.slice(0,150), peopleRows:(t.match(/QA /g)||[]).length,
              hasRetry:[...m.querySelectorAll('button')].filter(vis)
                .some(b=>/^Retry$/i.test((b.textContent||'').trim())) }; })()`;
  out.failed = { aborted, ...(await page.evaluate(state)) };
  // Case A: click Retry while the endpoint is STILL failing
  out.retryWhileFailing = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     return clickDeepest(document.querySelector('main'), /^Retry$/); })()`);
  await page.waitForTimeout(6000);
  out.afterRetryStillFailing = { aborted, ...(await page.evaluate(state)) };
  // Case B: let the endpoint recover, then click Retry
  fail=false;
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^Retry$/i.test((x.textContent||'').trim()));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.retryTarget=t;
  if(!t.none){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); }
  await page.waitForTimeout(8000);
  out.afterRecovery = { aborted, allowed, ...(await page.evaluate(state)) };
  await page.unroute(pattern);
  return out;
};
