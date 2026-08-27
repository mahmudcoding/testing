import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/workspaces/${WS}/members?limit=50',{credentials:'include'});
    const d=await r.json(); const a=d.members||[];
    const vis = el => { const rr=el.getBoundingClientRect(); if(rr.width<2||rr.height<2) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01;};
    const m=document.querySelector('main');
    const statusNodes=[...m.querySelectorAll('[class*=bg-green],[class*=status-offline],[class*=presence]')].filter(vis).length;
    return { members:a.length,
             withPresence:a.filter(x=>x.presence!==undefined).length,
             withCustomStatus:a.filter(x=>x.custom_status!==undefined).length,
             statusNodesInRows:statusNodes,
             holds: a.filter(x=>x.presence!==undefined).length===a.length && statusNodes===0 }; })()`);
};
