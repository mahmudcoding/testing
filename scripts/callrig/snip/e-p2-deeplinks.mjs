import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  const probes = [
    ['/w/'+WS+'/c/C0000000000BOGUS', 'channel id that does not exist'],
    ['/w/'+WS+'/d/D0000000000BOGUS', 'dm id that does not exist'],
    ['/w/W0000000000BOGUS/calendar', 'workspace id that does not exist'],
    ['/w/'+WS+'/files?scope=nonsense', 'unknown query value'],
    ['/w/'+WS+'/directories?tab=zzz', 'unknown tab value'],
  ];
  for(const [path, label] of probes){
    const errs=[];
    const onE=m=>{ if(m.type()==='error') errs.push(m.text().slice(0,70)); };
    page.on('console', onE);
    await page.goto(BASE+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    page.off('console', onE);
    out[label] = await page.evaluate(`(() => { ${VISFN}
       const t=(document.body.innerText||'').replace(/\\s+/g,' ');
       const ctl=[...document.querySelectorAll('main button, main a[href]')].filter(vis)
         .map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||'').slice(0,22)).filter(Boolean);
       return {url:location.pathname+location.search,
               text:t.slice(0,120),
               mainControls:[...new Set(ctl)].slice(0,5),
               blank: t.trim().length<20,
               rawKeyLeak:/[A-Z]{3,}_[A-Z_]{3,}|trace_id/.test(t)}; })()`);
    out[label].consoleErrors = errs.slice(0,2);
  }
  return out;
};
