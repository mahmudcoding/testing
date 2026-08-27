import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for(const route of ['security','about','appearance']){
    const net=[];
    const onR=r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.status()>=400)
      net.push(r.request().method()+' '+r.status()+' '+decodeURIComponent(u.split('/api/v1/')[1]).slice(0,50));};
    const errs=[];
    const onE=m=>{ if(m.type()==='error') errs.push(m.text().slice(0,80)); };
    page.on('response', onR); page.on('console', onE);
    await page.goto(BASE+'/w/'+WS+'/settings/'+route, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    page.off('response', onR); page.off('console', onE);
    out[route] = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main')||document.body;
       const t=(m.innerText||'').replace(/\\s+/g,' ');
       const nav=/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/;
       const all=[...m.querySelectorAll('button,a,input,select,textarea,[role=combobox],[role=switch],[role=radio]')]
         .map(e=>({tag:e.tagName, role:e.getAttribute('role')||'',
            tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
            al:(e.getAttribute('aria-label')||'').slice(0,24), ph:e.getAttribute('placeholder')||'',
            dis:e.disabled===true, vis:vis(e)?1:0}))
         .filter(e=>(e.tx||e.al||e.ph) && !nav.test(e.tx));
       const i=t.search(/Settings ›/);
       return {body:t.slice(i, i+330), nCtl:all.length, ctl:all.slice(0,10)}; })()`);
    out[route].errors4xx=net.slice(0,3); out[route].consoleErrors=errs.slice(0,3);
    out[route].url=page.url().replace(BASE,'');
  }
  return out;
};
