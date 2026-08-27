import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const measure = `(() => { ${VISFN}
  const h=document.documentElement;
  const pick=(sel)=>{const e=[...document.querySelectorAll(sel)].filter(vis)[0];
    return e? Math.round(parseFloat(getComputedStyle(e).fontSize)*100)/100+'px/'+Math.round(e.getBoundingClientRect().height) : 'n/a';};
  const vars={};
  ['--font-scale','--density-row','--app-font-scale','--font-size-body','--text-body'].forEach(v=>{
    const val=getComputedStyle(h).getPropertyValue(v).trim(); if(val) vars[v]=val; });
  return {rootFont:getComputedStyle(h).fontSize, bodyFont:getComputedStyle(document.body).fontSize,
    dataAttrs:[...h.attributes].filter(a=>/font|scale|density|theme/.test(a.name)).map(a=>a.name+'='+a.value).join(' '),
    vars, sidebarLink: pick('a[href*="/c/"]'), mainHeading: pick('main h1, main h2'),
    anyText: pick('main p, main span')}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const setScale = async (label) => {
    await page.keyboard.press('Meta+Shift+KeyT');
    await page.waitForTimeout(2200);
    const r = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
      const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
      return p? clickDeepest(p, new RegExp('^'+${JSON.stringify('L')}+'$')) : 'no panel'; })()`.replace('"L"', JSON.stringify(label)));
    await page.waitForTimeout(2200);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    return r;
  };
  out.setXS = await setScale('Extra small');
  out.atXS = await page.evaluate(measure);
  out.setXL = await setScale('Extra large');
  out.atXL = await page.evaluate(measure);
  out.setM = await setScale('Medium');
  out.atM = await page.evaluate(measure);
  return out;
};
