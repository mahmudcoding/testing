import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  // open a person's profile via the row's name button, with a real mouse
  const t = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
      .find(x=>/Open .*profile/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {none:true, labels:[...document.querySelector('main').querySelectorAll('button')].filter(vis)
      .map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,30)).slice(0,12)};
    const r=b.getBoundingClientRect();
    return {label:b.getAttribute('aria-label'), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.opened = t;
  if(t.none) return out;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(4000);
  out.popup = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const cands=[...document.querySelectorAll('[role=dialog],[data-state=open],aside,[class*=popover]')].filter(boxVis);
    const d=cands.pop(); if(!d) return {none:true};
    return { text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,320),
             controls:[...new Set([...d.querySelectorAll('button,a[href]')].filter(vis)
               .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,28)).filter(Boolean))].slice(0,16) }; })()`);
  // does it show the fields the profile screen collects?
  out.fieldsShown = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[data-state=open],aside,[class*=popover]')].filter(boxVis).pop();
    const t=(d?d.innerText:'')||'';
    return { department:/Quality/.test(t), jobTitle:/QA Engineer|Engineer/.test(t),
             timezone:/GMT|Tashkent|\\+05/.test(t), pronouns:/they|she|he\\//i.test(t),
             localTime:/\\d{1,2}:\\d{2}/.test(t) }; })()`);
  return out;
};
