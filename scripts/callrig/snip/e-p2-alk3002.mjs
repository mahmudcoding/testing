import {VISFN, BASE} from './e-p2-helpers.mjs';
const WS2='W4OWJSPNXQJYZ5R', WS1='W4QEF1XTURESO01';
export default async ({page}) => {
  const out={};
  const check = async (ws,label) => {
    await page.goto(BASE+'/w/'+ws+'/files', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
         .find(x=>/^Shared with me$/.test((x.textContent||'').trim()));
       if(!b) return {none:true}; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return {label, err:'no scope button'};
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(260);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(4500);
    return {label, ...(await page.evaluate(`(() => { ${VISFN}
      const strict=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<12) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
          if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01;};
      const m=document.querySelector('main');
      // visible leaves only, so opacity-0 layers cannot contribute
      const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0 && strict(e))
        .map(e=>(e.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      const emptyMsgs=leaves.filter(t=>/nothing|no files|empty|filter/i.test(t));
      const summary=(m.innerText||'').replace(/\\s+/g,' ').match(/\\d+ files? · [^·]+ · [^ ]+/);
      return {visibleEmptyMessages:[...new Set(emptyMsgs)].slice(0,4),
              summary:summary?summary[0]:'(none)',
              anyFilterApplied:/Images|Documents|Videos|Audio|Archives/.test('')}; })()`))};
  };
  out.ws2_empty = await check(WS2,'workspace 2 — Shared with me genuinely empty');
  out.ws1_hasFiles = await check(WS1,'workspace 1 — has one shared file (control)');
  return out;
};
