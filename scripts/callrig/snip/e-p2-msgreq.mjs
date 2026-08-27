import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.sidebarDMs = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('a[href*="/d/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,24)); })()`);
  out.reqButton = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/message requests/i.test(x.getAttribute('aria-label')||''));
    return b? b.getAttribute('aria-label')+' text="'+(b.innerText||'').replace(/\\s+/g,'')+'"' : 'not found'; })()`);
  await page.locator('button[aria-label^="Message requests"]').first().click();
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,320),
      ctrls: interactives(d).map(x=>x.label.slice(0,26)+(x.disabled?'[D]':'')).join(' | ').slice(0,260)} : 'no panel'; })()`);
  out.notifs = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.notifications||[];
    return {total:j.total, latest:a.slice(0,2).map(n=>String(n.category)+'/'+String(n.event_type)+' "'+String(n.title||'')+'"')}; })()`);
  return out;
};
