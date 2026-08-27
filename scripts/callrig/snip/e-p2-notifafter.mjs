import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.variants = await page.evaluate(`(async()=>{
    const g = async (u) => { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let n=-1; try{ const j=JSON.parse(t); const a=j.notifications||j.data||[]; n=a.length; }catch(e){}
      return u.replace('/api/v1/','')+' -> '+r.status+' items='+n+' body='+t.slice(0,90); };
    return [ await g('/api/v1/notifications?limit=30'),
             await g('/api/v1/notifications?limit=30&is_read=true'),
             await g('/api/v1/notifications?limit=30&status=read'),
             await g('/api/v1/notifications?limit=30&unread_only=false') ]; })()`);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return 'no panel';
    return {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,320),
      ctrls: interactives(d).map(x=>x.label.slice(0,24)).join(' | ').slice(0,240),
      rows: [...d.querySelectorAll('li')].filter(vis).length}; })()`);
  return out;
};
