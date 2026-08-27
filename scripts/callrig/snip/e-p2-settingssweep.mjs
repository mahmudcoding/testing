import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for (const tab of ['account','privacy','notifications','sessions','about']) {
    const errs=[]; const reqs=[];
    const onC = m => { if(m.type()==='error') errs.push(m.text().slice(0,120)); };
    const onR = r => { const u=r.url(); if(u.includes('/api/v1/')&&r.status()>=400) reqs.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,60)); };
    page.on('console', onC); page.on('response', onR);
    await page.goto(BASE+'/w/'+WS+'/settings/'+tab, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5200);
    out[tab] = await page.evaluate(`(() => { ${VISFN}
      const m = document.querySelector('main') || document.body;
      const ctl = [...m.querySelectorAll('button,a[href],input,select,textarea,[role=switch],[role=tab],[role=combobox]')]
        .filter(vis).map(n => {
          const t = n.tagName.toLowerCase();
          const nm = (n.getAttribute('aria-label')||n.getAttribute('placeholder')||n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44);
          const st = n.getAttribute('aria-checked')||n.getAttribute('aria-selected')||(n.type==='checkbox'?String(n.checked):'')||'';
          return t+(n.type?('['+n.type+']'):'')+' "'+nm+'"'+(st?(' ='+st):'');
        });
      return { title: (m.innerText||'').split('\\n')[0].slice(0,60), n: ctl.length, ctl: ctl.slice(0,42) };
    })()`);
    out[tab].consoleErrors = errs.slice(0,4);
    out[tab].httpErrors = reqs.slice(0,4);
    page.off('console', onC); page.off('response', onR);
  }
  return out;
};
