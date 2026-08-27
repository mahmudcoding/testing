import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const compact = `(() => { ${VISFN} ${boxVisFn}
  const m=document.querySelector('main')||document.body;
  const leaves=[...m.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
    .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim());
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  const shell = !!document.querySelector('nav') && [...document.querySelectorAll('button')].some(b=>vis(b)&&/^Calendar$/.test(b.getAttribute('aria-label')||''));
  return location.pathname.slice(0,40)+' || shell='+shell+' || '+(d? 'DIALOG: '+(d.innerText||'').replace(/\\n+/g,' / ').slice(0,60) : [...new Set(leaves)].slice(0,3).join(' / ').slice(0,80)); })()`;
export default async ({page}) => {
  const out={};
  for (const [tag,path] of [['badChannel','/c/C4QEZZZZZZZZZZZ'],['badMeeting','/calendar/S4OWZZZZZZZZZZZ']]) {
    await page.goto(BASE+'/w/'+WS+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    out[tag] = await page.evaluate(compact);
  }
  return out;
};
