import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const snap = `(() => { ${VISFN} ${boxVisFn}
  const m=document.querySelector('main')||document.body;
  const leaves=[...m.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
    .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,46));
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  return {url:location.pathname.slice(0,52),
    visible:[...new Set(leaves)].slice(0,10),
    dialog: d? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,120) : null,
    shellIntact: !!document.querySelector('nav') && [...document.querySelectorAll('button')].some(b=>vis(b)&&/^(Chat|Calendar|Files)$/.test(b.getAttribute('aria-label')||''))}; })()`;
export default async ({page}) => {
  const out={};
  const routes = [
    ['badChannel','/c/C4QEZZZZZZZZZZZ'],
    ['badMeeting','/calendar/S4OWZZZZZZZZZZZ'],
    ['badDM','/d/C4OWZZZZZZZZZZZ'],
    ['badFileParam','/files?file=F4OWZZZZZZZZZZZ'],
    ['malformedChannel','/c/not-an-id'],
    ['badWorkspace','/w/W4QZZZZZZZZZZZZ/directories'],
  ];
  for (const [tag,path] of routes) {
    const url = tag==='badWorkspace' ? BASE+path : BASE+'/w/'+WS+path;
    try {
      await page.goto(url, {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(6500);
      out[tag] = await page.evaluate(snap);
    } catch(e) { out[tag] = 'NAV ERROR '+String(e).slice(0,80); }
  }
  return out;
};
