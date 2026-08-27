import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const climb = (name) => `(() => { ${VISFN}
    const main=document.querySelector('main')||document.body;
    const btn=[...main.querySelectorAll('button')].filter(vis).find(b=>(b.innerText||'').replace(/\\s+/g,' ').trim()===${JSON.stringify(name)});
    if(!btn) return {missing:true};
    const levels=[]; let n=btn;
    for(let i=0;i<6 && n && n!==main;i++){
      levels.push({lvl:i, tag:n.tagName, cls:String(n.className||'').replace(/\\s+/g,' ').slice(0,45),
        nodes:n.querySelectorAll('*').length, textLen:(n.innerText||'').length,
        text:(n.innerText||'').replace(/\\s+/g,' ').slice(0,70)});
      n=n.parentElement; }
    return levels; })()`;
  out.bobLevels = await page.evaluate(climb('QA Bob'));
  // pick the level that holds exactly one person (textLen < 60) and the most nodes
  const sig = (name, lvl) => `(() => { ${VISFN}
    const main=document.querySelector('main')||document.body;
    const btn=[...main.querySelectorAll('button')].filter(vis).find(b=>(b.innerText||'').replace(/\\s+/g,' ').trim()===${JSON.stringify(name)});
    let n=btn; for(let i=0;i<${lvl};i++) n=n.parentElement;
    return {text:(n.innerText||'').replace(/\\s+/g,' ').slice(0,80), nodes:n.querySelectorAll('*').length,
      sig:[...n.querySelectorAll('*')].map(e=>e.tagName+'|'+String(e.className||'').replace(/\\s+/g,' ').trim().slice(0,75)+'|al='+(e.getAttribute('aria-label')||'')).join('\\n')}; })()`;
  return out;
};
