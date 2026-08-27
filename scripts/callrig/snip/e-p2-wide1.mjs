import {WS, BASE} from './e-p2-helpers.mjs';
const measure = () => {
  const d=document.documentElement;
  const vis=e=>{let x=e,o=1;while(x&&x!==d){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  // clipping on leaf nodes, and controls pushed off-screen
  const leaves=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0);
  const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1)
    .map(e=>({t:(e.textContent||'').trim().slice(0,28), sw:e.scrollWidth, cw:e.clientWidth,
              deliberate:/truncate|ellipsis/.test((e.className||'').toString())}));
  const off=[...document.querySelectorAll('button,a,input')].filter(vis)
    .filter(e=>e.getBoundingClientRect().left>=innerWidth)
    .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,26));
  const main=document.querySelector('main');
  return {vw:innerWidth, pageHScroll:d.scrollWidth-d.clientWidth,
    clippedTotal:clipped.length, clippedNonDeliberate:clipped.filter(c=>!c.deliberate).slice(0,4),
    offscreenControls:off, mainWidth: main? Math.round(main.getBoundingClientRect().width):null};
};
export default async ({page}) => {
  const out={};
  for (const [w,h] of [[2560,1440],[1920,1080]]) {
    await page.setViewportSize({width:w,height:h});
    out[`${w}x${h}`]={};
    for (const route of ['/directories','/calendar','/files','/c/C4QEGENERAL0001','/settings/about']) {
      await page.goto(`${BASE}/w/${WS}${route}`, {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(4200);
      out[`${w}x${h}`][route] = await page.evaluate(measure);
    }
  }
  await page.setViewportSize({width:1920,height:1080});
  return out;
};
