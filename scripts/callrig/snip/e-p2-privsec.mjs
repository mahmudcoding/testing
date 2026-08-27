import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for(const route of ['privacy','security']){
    const net=[];
    const onR = r=>{ const u=r.url(); if(/\/api\/v1\//.test(u))
      net.push(r.request().method()+' '+r.status()+' '+decodeURIComponent(u.split('/api/v1/')[1]).slice(0,52)); };
    page.on('response', onR);
    await page.goto(BASE+'/w/'+WS+'/settings/'+route, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    page.off('response', onR);
    out[route] = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main')||document.body;
       const t=(m.innerText||'').replace(/\\s+/g,' ');
       const nav=/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/;
       const ctl=[...m.querySelectorAll('button,[role=switch],[role=checkbox],input,select,[role=combobox]')].filter(vis)
         .map(e=>({tag:e.tagName, role:e.getAttribute('role')||'',
                   tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,28),
                   al:(e.getAttribute('aria-label')||'').slice(0,28),
                   checked:e.getAttribute('aria-checked'), dis:e.disabled||e.getAttribute('aria-disabled')}))
         .filter(e=>!nav.test(e.tx));
       const start=t.search(/Privacy|Security/);
       return {section:t.slice(start, start+380), nCtl:ctl.length, ctl:ctl.slice(0,12)}; })()`);
    out[route].net=[...new Set(net)].filter(x=>!/workspace-invites|users\/me\/roles|companies\//.test(x)).slice(0,5);
    out[route].url=page.url().replace(BASE,'');
  }
  return out;
};
