import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const SCALE=process.env.QA_SCALE||'Extra large';
const SKIPSET=process.env.QA_SKIPSET==='1';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
// clipping = scrollWidth > clientWidth on a leaf, EXCLUDING deliberate ellipsis truncation
const clip = `(() => { ${VISFN}
  const bad=[];
  [...document.querySelectorAll('*')].forEach(e=>{
    if(e.children.length) return;
    const t=(e.textContent||'').trim(); if(!t) return;
    if(!vis(e)) return;
    const cs=getComputedStyle(e);
    if(cs.textOverflow==='ellipsis') return;         // deliberate truncation
    if(e.clientWidth < 24) return;                   // sr-only / visually-hidden (clientWidth ~1)
    if(String(e.className||'').includes('sr-only')) return;
    if(cs.position==='absolute' && parseFloat(cs.width)<=1) return;
    if(e.scrollWidth > e.clientWidth+1 && e.clientWidth>0)
      bad.push(t.slice(0,34)+' ['+e.scrollWidth+'>'+e.clientWidth+']');
  });
  // controls pushed off-screen
  const off=[...document.querySelectorAll('button,a')].filter(vis)
    .filter(b=>b.getBoundingClientRect().left>=innerWidth || b.getBoundingClientRect().right<=0)
    .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26));
  return {clipped:[...new Set(bad)].slice(0,8), offscreen:[...new Set(off)].slice(0,6),
    docScrollW:document.documentElement.scrollWidth, innerW:innerWidth,
    bodyOverflowsX: document.documentElement.scrollWidth > innerWidth}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.keyboard.press('Meta+Shift+KeyT');
  await page.waitForTimeout(2500);
  out.setScale = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p, new RegExp('^'+${JSON.stringify(SCALE)}.replace(/ /g,'\\\\s+')+'$')) : 'no panel'; })()`);
  await page.waitForTimeout(2500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  out.rootFont = await page.evaluate(`(() => getComputedStyle(document.documentElement).fontSize)()`);
  for (const [tag,path] of [['files','/files'],['calendar','/calendar'],['directories','/directories?tab=people'],['channel','/c/C4QEGENERAL0001']]) {
    await page.goto(BASE+'/w/'+WS+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    out[tag] = await page.evaluate(clip);
  }
  return out;
};
