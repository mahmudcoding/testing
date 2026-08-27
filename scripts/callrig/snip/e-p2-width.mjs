import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const SCREENS=[['/w/'+WS+'/directories?tab=people','directories'],
               ['/w/'+WS+'/calendar','calendar'],
               ['/w/'+WS+'/files','files'],
               ['/w/'+WS+'/c/C4QEGENERAL0001','channel']];
export default async ({page}) => {
  const out={};
  const scan = `(() => { ${VISFN}
     const strict=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<10) return false; return vis(el);};
     const de=document.documentElement;
     const m=document.querySelector('main')||document.body;
     const leaves=[...m.querySelectorAll('*')].filter(el=>el.children.length===0 && strict(el));
     const clipped=leaves.filter(el=>el.scrollWidth>el.clientWidth+1 && el.clientWidth>=24
        && !/truncate/.test(String(el.className||'')))
       .map(el=>((el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,34))+' ['+el.clientWidth+'<'+el.scrollWidth+']');
     const pageWider = de.scrollWidth>de.clientWidth;
     const offRight=[...m.querySelectorAll('button,a[href],input')].filter(strict)
       .filter(el=>el.getBoundingClientRect().left>=innerWidth)
       .map(el=>(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,30));
     return {viewport:de.clientWidth+'x'+de.clientHeight, pageScrollsX:pageWider,
             docW:de.scrollWidth,
             clipped:[...new Set(clipped)].slice(0,6),
             unreachableControls: pageWider? '(page scrolls — test not valid)' : offRight.slice(0,5)}; })()`;
  for (const [w,h] of [[1280,800],[1440,900]]) {
    await page.setViewportSize({width:w, height:h});
    out['w'+w]={};
    for (const [path,label] of SCREENS){
      await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
      await page.waitForTimeout(8000);
      out['w'+w][label]=await page.evaluate(scan);
    }
  }
  await page.setViewportSize({width:1920, height:1080});
  return out;
};
