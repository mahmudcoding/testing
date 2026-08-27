import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.viewControls = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     return [...m.querySelectorAll('button,[role=tab],[role=radio]')].filter(vis)
       .map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,20))
             +(b.getAttribute('aria-pressed')?('/p='+b.getAttribute('aria-pressed')):'')
             +(b.getAttribute('aria-checked')?('/c='+b.getAttribute('aria-checked')):'')
             +(b.getAttribute('aria-selected')?('/s='+b.getAttribute('aria-selected')):''))
       .filter(Boolean).slice(0,18); })()`);
  out.switched = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     return clickDeepest(document.querySelector('main'), /^Week$/); })()`);
  await page.waitForTimeout(5000);
  out.week = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const chips=[...m.querySelectorAll('[data-testid="calendar-event-chip"]')];
     const visChips=chips.filter(vis);
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     return { headText:t.slice(0,220), chipsTotal:chips.length, chipsVisible:visChips.length,
              selectedState:[...m.querySelectorAll('button,[role=tab],[role=radio]')].filter(vis)
                .filter(b=>/^(Day|Week|Month)$/.test((b.textContent||'').trim()))
                .map(b=>(b.textContent||'').trim()+' p='+b.getAttribute('aria-pressed')+' c='+b.getAttribute('aria-checked')+' s='+b.getAttribute('aria-selected')) }; })()`);
  out.url = page.url().replace(/^https:\/\/[^/]+/,'');
  return out;
};
