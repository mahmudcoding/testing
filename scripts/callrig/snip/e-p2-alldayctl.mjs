import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const hits=[...d.querySelectorAll('*')].filter(n=>/^All day$/.test((n.textContent||'').trim()));
    const deepest=hits[hits.length-1];
    if(!deepest) return 'no All day text';
    const chain=[]; let n=deepest;
    for(let i=0;i<5 && n && n!==d;i++){
      const r=n.getBoundingClientRect();
      chain.push('<'+n.tagName+(n.getAttribute('role')?' role='+n.getAttribute('role'):'')+'> '
        +'for='+(n.getAttribute('for')||'-')+' id='+(n.id||'-')
        +' cls='+String(n.className||'').slice(0,34)+' rect='+Math.round(r.width)+'x'+Math.round(r.height)
        +' cursor='+getComputedStyle(n).cursor);
      n=n.parentElement; }
    // nearby checkbox/switch
    const boxes=[...d.querySelectorAll('input[type=checkbox],[role=switch],[role=checkbox],button')]
      .map(e=>{const r=e.getBoundingClientRect();
        return '<'+e.tagName+(e.getAttribute('role')?' role='+e.getAttribute('role'):'')+'> id='+(e.id||'-')
          +' ariaHidden='+(e.getAttribute('aria-hidden')||'-')+' checked='+(e.checked??'-')
          +' y='+Math.round(r.y)+' vis='+vis(e); })
      .filter(x=>/checkbox|switch/.test(x)).slice(0,6);
    return {chain, checkboxesInDialog: boxes}; })()`);
};
