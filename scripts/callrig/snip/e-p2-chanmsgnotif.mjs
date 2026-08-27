import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // NO navigation first — read the live bell as it stands
  out.liveBellBeforeReload = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelectorAll('button')].find(x=>vis(x)&&/^Notifications/i.test(x.getAttribute('aria-label')||''));
    return b? b.getAttribute('aria-label')+' badge="'+(b.innerText||'').replace(/\\s+/g,'')+'"' : '(no bell)'; })()`);
  out.apiNow = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.notifications||[];
    const cm=a.find(n=>String(n.category||'')==='messaging');
    return {total:j.total, unread:j.unread_count,
      channelMsg: cm? {type:cm.type, category:cm.category, eventType:cm.event_type, title:cm.title,
        actor:cm.actor_name, titleKey:cm.title_key, resource:String(cm.resource_id||'').slice(0,16),
        body:String(cm.body||'').slice(0,120)} : null}; })()`);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.bellAfterReload = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelectorAll('button')].find(x=>vis(x)&&/^Notifications/i.test(x.getAttribute('aria-label')||''));
    return b? b.getAttribute('aria-label')+' badge="'+(b.innerText||'').replace(/\\s+/g,'')+'"' : '(no bell)'; })()`);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? [...d.querySelectorAll('li button')].filter(vis).map(b=>(b.innerText||'').replace(/\\s+/g,' ').slice(0,72)) : ['no panel']; })()`);
  return out;
};
