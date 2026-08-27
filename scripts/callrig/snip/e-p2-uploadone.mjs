import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl';
const FILE=process.env.QA_UP||'dmimage.png';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(/upload/.test(u)&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,180);}catch(e){} writes.push(r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.getByRole('button',{name:'Upload'}).first().click();
  await page.waitForTimeout(2500);
  await page.locator('input[type=file]').first().setInputFiles([DIR+'/'+FILE]);
  await page.waitForTimeout(3000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Upload \\d+ files?$/); })()`);
  await page.waitForTimeout(7000);
  out.uploads = writes.slice(0,2);
  await page.keyboard.press('Escape');
  return out;
};
